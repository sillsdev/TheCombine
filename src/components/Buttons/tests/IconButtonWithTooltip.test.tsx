import { Icon } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

import IconButtonWithTooltip, {
  IconButtonWithTooltipProps,
} from "components/Buttons/IconButtonWithTooltip";

const mockLabel = "button-label";
const mockOnClick = jest.fn();
const mockText = "YES!";
const mockTextId = "no?";

const renderButton = async (
  props?: Partial<IconButtonWithTooltipProps>
): Promise<void> => {
  await act(async () => {
    render(
      <IconButtonWithTooltip
        buttonLabel={mockLabel}
        icon={<Icon />}
        onClick={mockOnClick}
        {...props}
      />
    );
  });
};

describe("IconButtonWithTooltip", () => {
  const agent = userEvent.setup();

  test("click", async () => {
    await renderButton();
    expect(mockOnClick).not.toHaveBeenCalled();
    await agent.click(screen.getByLabelText(mockLabel));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("tooltip available when disabled", async () => {
    await renderButton({ disabled: true, textId: mockTextId });
    expect(screen.queryByLabelText(mockTextId)).toBeTruthy();
  });

  test("text overrides textId for tooltip", async () => {
    await renderButton({ text: mockText, textId: mockTextId });
    expect(screen.queryByLabelText(mockText)).toBeTruthy();
    expect(screen.queryByLabelText(mockTextId)).toBeNull();
  });
});
