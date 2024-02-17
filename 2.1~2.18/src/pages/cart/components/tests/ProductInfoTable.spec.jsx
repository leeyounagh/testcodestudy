import { screen, within } from '@testing-library/react';
import { vi } from 'node_modules/vitest/dist/index';
import React from 'react';

import ProductInfoTable from '@/pages/cart/components/ProductInfoTable';
import {
  mockUseCartStore,
  mockUseUserStore,
} from '@/utils/test/mockZustandStore';
import render from '@/utils/test/render';

beforeEach(() => {
  mockUseUserStore({ user: { id: 10 } });
  mockUseCartStore({
    cart: {
      6: {
        id: 6,
        title: 'Handmade Cotton Fish',
        price: 809,
        description:
          'The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body..',
        images: ['asdfasdf', 'asdfasdf', 'asdfasdf'],
        count: 3,
      },
    },
    7: {
      id: 6,
      title: 'Handmade Cotton Fish',
      price: 809,
      description:
        'The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body..',
      images: ['asdfasdf', 'asdfasdf', 'asdfasdf'],
      count: 3,
    },
  });
});

it('장바구니에 포함된 아이템들의 이름, 수량, 합계가 제대로 노출된다', async () => {
  await render(<ProductInfoTable></ProductInfoTable>);

  const [firstItem, secondItem] = screen.getAllByRole('row');

  expect(
    within(firstItem).getByText('Handmade Cotton Fish'),
  ).toBeInTheDocument();
  expect(within(firstItem).getByRole('textbox')).toHaveValue('3');
  expect(within(firstItem).getByText('$2,427.00')).toBeInTheDocument();

  expect(
    within(secondItem).getByText('Handmade Cotton Fish'),
  ).toBeInTheDocument();
  expect(within(secondItem).getByRole('textbox')).toHaveValue('3');
  expect(within(secondItem).getByText('$2,427.00')).toBeInTheDocument();
});

it('특정 아이템의 수량이 변경되었을 때 값이 재계산되어 올바르게 업데이트 된다', async () => {
  const { user } = await render(<ProductInfoTable></ProductInfoTable>);
  const [firstItem] = screen.getAllByRole('row');

  const input = within(firstItem).getByRole('textbox');

  await user.clear(input);
  await user.type(input, '5');
  expect(screen.getByText('$4,045.00')).toBeInTheDocument();
});

it('특정 아이템의 수량이 1000개로 변경될 경우 "최대 999개 까지 가능합니다!"라고 경고 문구가 노출된다', async () => {
  const alertSpy = vi.fn();
  vi.stubGlobal('alert', alertSpy);

  const { user } = await render(<ProductInfoTable></ProductInfoTable>);
  const [firstItem] = screen.getAllByRole('row');
  const input = within(firstItem).getByRole('textbox');

  await user.clear(input);
  await user.type(input, '1000');

  expect(alertSpy).toHaveBeenNthCalledWith(1, '최대 999개 까지 가능 합니다!');
});

it('특정 아이템의 삭제 버튼을 클릭할 경우 해당 아이템이 사라진다', async () => {
  const { user } = await render(<ProductInfoTable></ProductInfoTable>);
  const [, secondItem] = screen.getAllByRole('row');

  const deleteButton = within(secondItem).getByRole('button');

  expect(screen.getByText('Awesome Concrete Shirt')).toBeInTheDocument();

  await user.click(deleteButton);
  // queryBy~: 요소의 존재 유무 판단. 요소가 존재하지 않아도 에러 x
  expect(screen.queryByText('Awesome Concrete Shirt')).not.toBeInTheDocument();
});
