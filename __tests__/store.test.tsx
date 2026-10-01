import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearAll, useGoals, useVentures} from '../src/store';
import type {Venture} from '../src/lib/business';

const v: Venture = {
  id: 'v1',
  name: 'Shop',
  category: 'SaaS',
  status: 'active',
  revenue: 100,
  expenses: 0,
};

let saveFromOtherTab: (next: Venture[]) => Promise<void>;

function Writer() {
  saveFromOtherTab = useVentures().save;
  return null;
}
function Reader() {
  const {items} = useVentures();
  const {items: goals} = useGoals();
  return <Text>{`${items.length} ventures, ${goals.length} goals`}</Text>;
}

const shown = (tree: ReactTestRenderer.ReactTestRenderer) =>
  tree.root.findByType(Text).props.children;

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('keeps every mounted screen in sync and clears only app keys', async () => {
  await AsyncStorage.setItem('unrelated', 'keep me');
  await AsyncStorage.setItem('goals', 'corrupt{');
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <>
        <Writer />
        <Reader />
      </>,
    );
  });
  expect(shown(tree)).toBe('0 ventures, 0 goals');

  await ReactTestRenderer.act(async () => {
    await saveFromOtherTab([v]);
  });
  expect(shown(tree)).toBe('1 ventures, 0 goals');
  expect(JSON.parse((await AsyncStorage.getItem('ventures'))!)).toEqual([v]);

  await ReactTestRenderer.act(async () => {
    await clearAll();
  });
  expect(shown(tree)).toBe('0 ventures, 0 goals');
  expect(await AsyncStorage.getItem('unrelated')).toBe('keep me');
});

it('never overwrites stored data after a failed load', async () => {
  await AsyncStorage.setItem('ventures', JSON.stringify([v]));
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
    new Error('disk busy'),
  );
  let errorShown: string | null = null;
  function Probe() {
    const {save, error} = useVentures();
    saveFromOtherTab = save;
    errorShown = error;
    return null;
  }
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe />);
  });
  await ReactTestRenderer.act(async () => {
    await saveFromOtherTab([{...v, id: 'v2', name: 'New'}]);
  });
  expect(JSON.parse((await AsyncStorage.getItem('ventures'))!)).toEqual([v]);
  expect(errorShown).toMatch(/not saved/);
});
