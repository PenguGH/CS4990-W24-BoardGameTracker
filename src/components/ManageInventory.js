import React, { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/api";
import { Button, Flex, Heading, TextField, View } from "@aws-amplify/ui-react";
import { listBoardGames, getBoardGame } from "../graphql/queries";
import {
  createBoardGame as createBoardGameMutation,
  deleteBoardGame as deleteBoardGameMutation,
  updateBoardGame as updateBoardGameMutation,
} from "../graphql/mutations";

const client = generateClient();

const ManageInventory = () => {
  console.log("ManageInventory component rendered");

  const [boardGames, setBoardGames] = useState([]);
  const [editingBoardGame, setEditingBoardGame] = useState(null);

  useEffect(() => {
    fetchBoardGames();
  }, []);

  async function fetchBoardGames() {
    const apiData = await client.graphql({ query: listBoardGames });
    const boardGamesFromAPI = apiData.data.listBoardGames.items;
    setBoardGames(boardGamesFromAPI);
    return boardGamesFromAPI;
  }

  async function getBoardGameInfo(boardGameId) {
    const apiData = await client.graphql({
      query: getBoardGame,
      variables: { id: boardGameId },
    });

    const boardGameFromAPI = apiData.data.getBoardGame;
    return boardGameFromAPI;
  }

  // this is to create new board games
  async function submitBoardGame(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      id: form.get("id"),
      name: form.get("name"),
      description: form.get("description"),
      quantity: form.get("quantity"),
      price: form.get("price"),
    };

    if (editingBoardGame) {
      //update existing board game
      await updateBoardGame(data);
      setEditingBoardGame(null);
    } else {
      await client.graphql({
        query: createBoardGameMutation,
        variables: { input: data },
      });
    }
    fetchBoardGames();
    event.target.reset();
  }

  async function deleteBoardGame({ id }) {
    const newBoardGames = boardGames.filter((boardGame) => boardGame.id !== id);
    setBoardGames(newBoardGames);
    await client.graphql({
      query: deleteBoardGameMutation,
      variables: { input: { id } },
    });
  }

  async function updateBoardGame(updatedData) {
    await client.graphql({
      query: updateBoardGameMutation,
      variables: { input: updatedData },
    });
  }

  async function editBoardGame(id) {
    const boardGameInfo = await getBoardGameInfo(id);
    setEditingBoardGame(boardGameInfo);
  }

  async function updateBoardGameField(id, field, value) {
    const updatedBoardGames = boardGames.map((boardGame) => {
      if (boardGame.id === id) {
        return { ...boardGame, [field]: value };
      }
      return boardGame;
    });

    setBoardGames(updatedBoardGames);
  }

  async function saveBoardGame(id) {
    setEditingBoardGame(null);
    // Here you can perform any additional logic or API calls to save the changes
  }

  return (
    <Flex direction="column" alignItems="center">
      <View as="form" margin="3rem 0" onSubmit={submitBoardGame}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="id"
            placeholder="id"
            label="Board Game id"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="name"
            placeholder="Name"
            label="Board Game Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Description"
            label="Board Game Description"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="quantity"
            placeholder="Quantity"
            label="Board Game Quantity"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="price"
            placeholder="Price"
            label="Board Game Price"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            {editingBoardGame ? "Update Board Game" : "Create Board Game"}
          </Button>
        </Flex>
      </View>
      <Flex direction="column" alignItems="center">
        <Heading level={2}>Inventory Details</Heading>
        <View margin="3rem 0">
          <table style={{ borderCollapse: "collapse", width: "80%" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Description</th>
                <th style={tableHeaderStyle}>Quantity</th>
                <th style={tableHeaderStyle}>Price</th>
                <th style={tableHeaderStyle}>Edit</th>
                <th style={tableHeaderStyle}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {boardGames.map((boardGame) => (
                <tr key={boardGame.id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    {editingBoardGame === boardGame.id ? (
                      <input type="text" value={boardGame.id} readOnly />
                    ) : (
                      boardGame.id
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingBoardGame === boardGame.id ? (
                      <input
                        type="text"
                        value={boardGame.name}
                        onChange={(e) =>
                          updateBoardGameField(
                            boardGame.id,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      boardGame.name
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingBoardGame === boardGame.id ? (
                      <input
                        type="text"
                        value={boardGame.description}
                        onChange={(e) =>
                          updateBoardGameField(
                            boardGame.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      boardGame.description
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingBoardGame === boardGame.id ? (
                      <input
                        type="number"
                        value={boardGame.quantity}
                        onChange={(e) =>
                          updateBoardGameField(
                            boardGame.id,
                            "quantity",
                            parseInt(e.target.value, 10)
                          )
                        }
                      />
                    ) : (
                      boardGame.quantity
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingBoardGame === boardGame.id ? (
                      <input
                        type="number"
                        value={boardGame.price}
                        onChange={(e) =>
                          updateBoardGameField(
                            boardGame.id,
                            "price",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    ) : (
                      boardGame.price
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingBoardGame === boardGame.id ? (
                      <Button
                        variation="link"
                        onClick={() => saveBoardGame(boardGame.id)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variation="link"
                        onClick={() => editBoardGame(boardGame.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    <Button
                      variation="link"
                      onClick={() => deleteBoardGame(boardGame)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </View>
      </Flex>
    </Flex>
  );
};

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  background: "#f2f2f2",
};

const tableRowStyle = {
  border: "1px solid #ddd",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
};

export default ManageInventory;