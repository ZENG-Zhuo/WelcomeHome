import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Space,
  Collapse,
  Popconfirm,
  message,
  Select,
  Tooltip,
} from "antd";
import axios from "axios";
import config from "../config";

const { Option } = Select;
const { Panel } = Collapse;

interface Piece {
  pieceNum: number;
  pDescription: string;
  length: number;
  width: number;
  height: number;
  roomNum: number;
  shelfNum: number;
  pNotes: string;
}

interface Item {
  pDescription: string;
  color?: string;
  isNew?: boolean;
  material?: string;
  mainCategory?: string;
  subCategory?: string;
  pieces: Piece[];
}

const DonationForm: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/categories`);
        setCategories(response.data);
      } catch (error) {
        message.error("Failed to fetch categories.");
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/locations`);
        setLocations(response.data);
      } catch (error) {
        message.error("Failed to fetch locations.");
      }
    };

    fetchCategories();
    fetchLocations();
  }, []);

  const addItem = () => {
    const newItem: Item = {
      pDescription: "",
      color: "",
      isNew: false,
      material: "",
      mainCategory: "",
      subCategory: "",
      pieces: [
        {
          pieceNum: 1,
          pDescription: "",
          length: 0,
          width: 0,
          height: 0,
          roomNum: 0,
          shelfNum: 0,
          pNotes: "",
        },
      ],
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const addPiece = (itemIndex: number) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        const newPiece: Piece = {
          pieceNum: item.pieces.length + 1,
          pDescription: "",
          length: 0,
          width: 0,
          height: 0,
          roomNum: 0,
          shelfNum: 0,
          pNotes: "",
        };
        return { ...item, pieces: [...item.pieces, newPiece] };
      }
      return item;
    });
    setItems(newItems);
  };

  const removePiece = (itemIndex: number, pieceIndex: number) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        const newPieces = item.pieces.filter((_, j) => j !== pieceIndex);
        return { ...item, pieces: newPieces };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleItemChange = (
    itemIndex: number,
    key: keyof Item | string,
    value: any
  ) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        if (key === "category") {
          const [mainCategory, subCategory] = value.split("-");
          return { ...item, mainCategory, subCategory };
        }
        return { ...item, [key]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const handlePieceChange = (
    itemIndex: number,
    pieceIndex: number,
    key: keyof Piece | string,
    value: string | number
  ) => {
    const newItems = items.map((item, i) => {
      if (i === itemIndex) {
        const newPieces = item.pieces.map((piece, j) => {
          if (j === pieceIndex) {
            if (key === "location") {
              const [roomNum, shelfNum] = (value as string).split("-");
              return { ...piece, roomNum: +roomNum, shelfNum: +shelfNum };
            }
            return { ...piece, [key]: value as Piece[keyof Piece] };
          }
          return piece;
        });
        return { ...item, pieces: newPieces };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${config.apiUrl}/accept_donation`, { userName, items });
      message.success("Donation accepted successfully.");
      setItems([]); // Clear the items after successful submission
      form.resetFields();
    } catch (error: any) {
      console.error("Error details:", error);
      message.error(
        `Failed to accept donation: ${
          error.response.data.message || error.message
        }`
      );
    }
  };

  // New function to check if user is a donor
  const checkDonor = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/check_donor`, {
        userName,
      });
      if (response.data.isDonor) {
        message.success("User is a registered donor.");
      } else {
        message.warning("User is not a registered donor.");
      }
    } catch (error: any) {
      message.error(
        `Error checking donor status: ${
          error.response.data.message || error.message
        }`
      );
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical">
        <Form.Item label="Donor Username" required>
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Form.Item>
        <Button
          type="primary"
          onClick={checkDonor}
          style={{ marginBottom: 16 }}
        >
          Check Donor
        </Button>
        <Button type="primary" onClick={addItem}>
          Add Item
        </Button>
        <Collapse style={{ marginTop: 16 }}>
          {items.map((item, index) => (
            <Panel header={`Item ${index + 1}`} key={index}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {/* Item Description */}
                <Tooltip title="Enter a brief description of the item (e.g., Wooden Table)">
                  <Input
                    placeholder="Item description"
                    value={item.pDescription}
                    onChange={(e) =>
                      handleItemChange(index, "pDescription", e.target.value)
                    }
                  />
                </Tooltip>

                {/* Category Select */}
                <Tooltip title="Select the category of the item">
                  <Select
                    placeholder="Select Category"
                    style={{ width: 250 }}
                    onChange={(value) =>
                      handleItemChange(index, "category", value)
                    } // Handles category change
                  >
                    {categories.map((category) => (
                      <Option
                        key={`${category.mainCategory}-${category.subCategory}`}
                        value={`${category.mainCategory}-${category.subCategory}`}
                      >
                        {category.mainCategory} - {category.subCategory}
                      </Option>
                    ))}
                  </Select>
                </Tooltip>

                {/* Color Field */}
                <Tooltip title="Specify the color of the item (e.g., Red, Blue)">
                  <Input
                    placeholder="Color"
                    value={item.color}
                    onChange={(e) =>
                      handleItemChange(index, "color", e.target.value)
                    }
                  />
                </Tooltip>

                {/* Is New Field */}
                <Tooltip title="Is the item new? Select Yes or No">
                  <Select
                    placeholder="Is the item new?"
                    value={item.isNew ? "Yes" : "No"}
                    onChange={(value) =>
                      handleItemChange(index, "isNew", value === "Yes")
                    }
                    style={{ width: 250 }}
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Tooltip>

                {/* Material Field */}
                <Tooltip title="Describe the material of the item (e.g., Metal, Wood)">
                  <Input
                    placeholder="Material"
                    value={item.material}
                    onChange={(e) =>
                      handleItemChange(index, "material", e.target.value)
                    }
                  />
                </Tooltip>

                <Space>
                  <Button type="link" onClick={() => removeItem(index)}>
                    Delete Item
                  </Button>
                </Space>

                {/* Pieces Section */}
                <div>
                  <strong>Pieces:</strong>
                  {item.pieces.map((piece, pieceIndex) => (
                    <Space key={pieceIndex} style={{ marginBottom: 8 }}>
                      {/* Piece Description */}
                      <Tooltip title="Enter a brief description of the piece (e.g. Chair)">
                        <Input
                          placeholder="Piece description"
                          value={piece.pDescription}
                          onChange={(e) =>
                            handlePieceChange(
                              index,
                              pieceIndex,
                              "pDescription",
                              e.target.value
                            )
                          }
                        />
                      </Tooltip>

                      {/* Piece Dimensions */}
                      <Tooltip title="Enter the length of the piece in centimeters">
                        <Input
                          type="number"
                          placeholder="Length (cm)"
                          value={piece.length}
                          onChange={(e) =>
                            handlePieceChange(
                              index,
                              pieceIndex,
                              "length",
                              +e.target.value
                            )
                          }
                        />
                      </Tooltip>
                      <Tooltip title="Enter the width of the piece in centimeters">
                        <Input
                          type="number"
                          placeholder="Width (cm)"
                          value={piece.width}
                          onChange={(e) =>
                            handlePieceChange(
                              index,
                              pieceIndex,
                              "width",
                              +e.target.value
                            )
                          }
                        />
                      </Tooltip>
                      <Tooltip title="Enter the height of the piece in centimeters">
                        <Input
                          type="number"
                          placeholder="Height (cm)"
                          value={piece.height}
                          onChange={(e) =>
                            handlePieceChange(
                              index,
                              pieceIndex,
                              "height",
                              +e.target.value
                            )
                          }
                        />
                      </Tooltip>

                      {/* Location Select for Piece */}
                      <Tooltip title="Select the location of the piece">
                        <Select
                          placeholder="Select Location"
                          style={{ width: 250 }}
                          onChange={(value) =>
                            handlePieceChange(
                              index,
                              pieceIndex,
                              "location",
                              value
                            )
                          }
                        >
                          {locations.map((location) => (
                            <Option
                              key={`${location.roomNum}-${location.shelfNum}`}
                              value={`${location.roomNum}-${location.shelfNum}`}
                            >
                              {location.roomNum} - {location.shelf} (
                              {location.shelfDescription})
                            </Option>
                          ))}
                        </Select>
                      </Tooltip>

                      {/* Notes Field for Piece */}
                      <Tooltip title="Any additional notes or comments about the piece">
                        <Input
                          placeholder="Notes"
                          value={piece.pNotes}
                          onChange={(e) =>
                            handlePieceChange(
                              index,
                              pieceIndex,
                              "pNotes",
                              e.target.value
                            )
                          }
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Are you sure to delete this piece?"
                        onConfirm={() => removePiece(index, pieceIndex)}
                      >
                        <Button type="link">Delete Piece</Button>
                      </Popconfirm>
                    </Space>
                  ))}
                  <Button type="link" onClick={() => addPiece(index)}>
                    Add Piece
                  </Button>
                </div>
              </Space>
            </Panel>
          ))}
        </Collapse>
        <Button type="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
          Submit Donation
        </Button>
      </Form>
    </div>
  );
};

export default DonationForm;
