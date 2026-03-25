import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SortOptions, {
  SortOptionsProps,
} from "components/ProjectUsers/SortOptions";

const renderSortOptions = async (
  props: Partial<SortOptionsProps> = {}
): Promise<void> => {
  await act(async () => {
    render(
      <SortOptions
        includeEmail={props.includeEmail}
        onChange={props.onChange ?? jest.fn()}
        onReverseClick={props.onReverseClick}
      />
    );
  });
};

describe("SortOptions", () => {
  it("has no reverse button when no reverse function provided", async () => {
    await renderSortOptions();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("has reverse button when reverse function provided", async () => {
    const mockReverse = jest.fn();
    await renderSortOptions({ onReverseClick: mockReverse });
    expect(mockReverse).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button"));
    expect(mockReverse).toHaveBeenCalledTimes(1);
  });
});
