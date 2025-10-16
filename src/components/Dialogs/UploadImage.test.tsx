import { Button as MockFIB } from "@mui/material";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";

import ImageUpload from "components/Dialogs/UploadImage";

const mockFile = new File(["test"], "test.png", { type: "image/png" });

jest.mock("components/Buttons/FileInputButton", () => ({
  __esModule: true,
  default: (props: {
    children?: ReactNode;
    updateFile: (file: File) => void;
  }) => (
    <MockFIB onClick={() => props.updateFile(mockFile)}>
      {props.children}
    </MockFIB>
  ),
}));

const mockUploadImage = jest.fn();
const mockDoneCallback = jest.fn();

const renderImageUpload = async (): Promise<void> => {
  await act(async () => {
    render(
      <ImageUpload
        uploadImage={mockUploadImage}
        doneCallback={mockDoneCallback}
      />
    );
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await renderImageUpload();
});

describe("ImageUpload", () => {
  it("renders with Save button disabled when no file is selected", async () => {
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("enables Save button when a file is selected", async () => {
    // Click Browse button to select a file
    const browseButton = screen.getByRole("button", { name: /browse/i });
    await userEvent.click(browseButton);
    
    // Save button should now be enabled
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeEnabled();
  });

  it("calls uploadImage when Save is clicked with a file selected", async () => {
    // Mock uploadImage to return a resolved promise
    mockUploadImage.mockResolvedValue(undefined);
    
    // Click Browse button to select a file
    const browseButton = screen.getByRole("button", { name: /browse/i });
    await userEvent.click(browseButton);
    
    // Click the Save button
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);
    
    // Verify uploadImage was called
    expect(mockUploadImage).toHaveBeenCalledWith(mockFile);
  });
});
