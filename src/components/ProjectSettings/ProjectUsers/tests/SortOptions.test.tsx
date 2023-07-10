import renderer from "react-test-renderer";

import "tests/reactI18nextMock.ts";

import SortOptions, {
  SortOptionsProps,
  reverseButtonId,
} from "components/ProjectSettings/ProjectUsers/SortOptions";

let testRenderer: renderer.ReactTestRenderer;

const renderSortOptions = (props: Partial<SortOptionsProps> = {}): void => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <SortOptions
        includeEmail={props.includeEmail}
        onChange={props.onChange ?? jest.fn()}
        onReverseClick={props.onReverseClick}
      />
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("SortOptions", () => {
  it("has no reverse button when no reverse function provided", () => {
    renderSortOptions();
    const button = testRenderer.root.findAllByProps({ id: reverseButtonId });
    expect(button).toHaveLength(0);
  });

  it("has reverse button when reverse function provided", () => {
    const mockReverse = jest.fn();
    renderSortOptions({ onReverseClick: mockReverse });
    const button = testRenderer.root.findByProps({ id: reverseButtonId });
    expect(button).not.toBeNull();
    button.props.onClick();
    expect(mockReverse).toBeCalledTimes(1);
  });
});
