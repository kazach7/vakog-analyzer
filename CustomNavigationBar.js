import { signOut } from "firebase/auth";
import React from "react";
import {
  ActivityIndicator,
  Appbar,
  Button,
  DefaultTheme,
  Dialog,
  IconButton,
  Menu,
  Portal,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { deleteDocument, getListOfDocuments, save, saveAs } from "./db";
import { auth } from "./firebase";
import { setDocument } from "./store";

const CustomNavigationBar = ({ navigation, back, route }) => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(null);
  const [listOfDocuments, setListOfDocuments] = React.useState(null);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [nameInputValue, setNameInputValue] = React.useState("");
  const [nameInputError, setNameInputError] = React.useState(false);

  const openMenu = async () => setMenuVisible(true);
  const closeMenu = async () => setMenuVisible(false);

  const document = useSelector((state) => state.document);
  const autoAnalysis = useSelector((state) => state.settings.autoAnalysis);
  const isAnalysing = useSelector((state) => state.settings.isAnalysing);

  const dispatch = useDispatch();

  const closeOpenDocumentDialog = () => {
    setOpenDialog(null);
    setListOfDocuments(null);
    setSelectedDocument(null);
  };

  const closeSaveDocumentAsDialog = () => {
    setOpenDialog(null);
    setListOfDocuments(null);
    setNameInputError(false);
  };

  const openDocument = () => {
    closeOpenDocumentDialog();
    setListOfDocuments(null);
    dispatch(setDocument(selectedDocument));
  };

  const logout = async () => {
    await closeMenu();
    signOut(auth)
      .then(() => {
        navigation.navigate("Login");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  let title;
  if (route.name === "Mappings") {
    title = "Mappings";
  } else if (route.name === "Suggestions") {
    title = "Edit suggestions";
  } else if (route.name === "Home") {
    if (document.name === null) {
      title = "New document";
    } else {
      title = document.name;
    }
  } else if (route.name === "Settings") {
    title = "Settings";
  } else {
    title = "VAKOGAnalyzer";
  }

  return (
    <>
      <Appbar.Header>
        {["Mappings", "Suggestions", "Settings"].includes(route.name) ? (
          <Appbar.BackAction onPress={() => navigation.pop()} />
        ) : null}
        <Appbar.Content title={title} visible={false} />
        {route.name === "Home" ? (
          <>
            {autoAnalysis && isAnalysing ? (
              <ActivityIndicator color="white" style={{ marginRight: 15 }} />
            ) : null}
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <Appbar.Action
                  color="white"
                  icon={"file-document"}
                  onPress={openMenu}
                />
              }
            >
              <Menu.Item
                title="Open document"
                onPress={async () => {
                  setMenuVisible(false);
                  setOpenDialog("openDialog");
                  setListOfDocuments(await getListOfDocuments());
                }}
              />
              <Menu.Item
                title="Save document as"
                onPress={async () => {
                  setMenuVisible(false);
                  setOpenDialog("saveDialog");
                  setListOfDocuments(await getListOfDocuments());
                }}
              />
              {document.id !== null ? (
                <Menu.Item title="Save document" onPress={save} />
              ) : null}
              <Menu.Item
                title="New document"
                onPress={async () => {
                  setMenuVisible(false);
                  dispatch(
                    setDocument({
                      id: null,
                      name: null,
                      content: "",
                    })
                  );
                }}
              />
            </Menu>
            <Appbar.Action
              icon="cog"
              color="white"
              onPress={() => navigation.navigate("Settings")}
            />
          </>
        ) : null}
      </Appbar.Header>
      <Portal>
        <Dialog
          visible={openDialog == "openDialog"}
          onDismiss={closeOpenDocumentDialog}
        >
          <Dialog.Title>Choose document to open</Dialog.Title>
          <Dialog.Content>
            {listOfDocuments ? (
              <RadioButton.Group
                onValueChange={(value) => setSelectedDocument(value)}
                value={selectedDocument}
              >
                {listOfDocuments.length > 0 ? (
                  listOfDocuments.map((doc) => (
                    <RadioButton.Item
                      key={doc.id}
                      label={doc.name}
                      value={doc}
                    />
                  ))
                ) : (
                  <Text>No documents saved.</Text>
                )}
              </RadioButton.Group>
            ) : (
              <ActivityIndicator />
            )}
          </Dialog.Content>
          {listOfDocuments ? (
            <Dialog.Actions
              style={
                listOfDocuments.length > 0
                  ? { justifyContent: "space-between" }
                  : null
              }
            >
              {listOfDocuments.length > 0 ? (
                <>
                  <IconButton
                    icon={"delete"}
                    color={DefaultTheme.colors.primary}
                    onPress={() => {
                      const id = selectedDocument.id;
                      deleteDocument(id);
                      setListOfDocuments(
                        listOfDocuments.filter((d) => d.id != id)
                      );
                      setSelectedDocument(null);
                      if (id == document.id) {
                        dispatch(
                          setDocument({
                            id: null,
                            name: null,
                            content: document.content,
                          })
                        );
                      }
                    }}
                  />
                  <Text>
                    <Button onPress={openDocument}>Open</Button>
                    <Button onPress={closeOpenDocumentDialog}>Cancel</Button>
                  </Text>
                </>
              ) : (
                <Button
                  onPress={closeOpenDocumentDialog}
                  style={{ alignSelf: "flex-end" }}
                >
                  Cancel
                </Button>
              )}
            </Dialog.Actions>
          ) : null}
        </Dialog>
        <Dialog
          visible={openDialog == "saveDialog"}
          onDismiss={closeSaveDocumentAsDialog}
        >
          <Dialog.Title>Save document as</Dialog.Title>
          <Dialog.Content>
            {listOfDocuments ? (
              <>
                <Text style={{ paddingBottom: 20 }}>
                  Provide a name for the document or choose an existing document
                  to overwrite.
                </Text>
                <TextInput
                  onFocus={() => setSelectedDocument(null)}
                  label={"Document name"}
                  value={nameInputValue}
                  error={nameInputError}
                  onChangeText={(text) => setNameInputValue(text)}
                />
                {listOfDocuments.length > 0 ? (
                  <RadioButton.Group
                    onValueChange={(value) => setSelectedDocument(value)}
                    value={selectedDocument}
                  >
                    {listOfDocuments.map((doc) => (
                      <RadioButton.Item label={doc.name} value={doc} />
                    ))}
                  </RadioButton.Group>
                ) : null}
              </>
            ) : (
              <ActivityIndicator />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={async () => {
                if (!selectedDocument) {
                  if (nameInputValue.length === 0) {
                    setNameInputError(true);
                  } else if (
                    listOfDocuments
                      .map((doc) => doc.name)
                      .includes(nameInputValue)
                  ) {
                    setNameInputError(true);
                  } else {
                    const docId = await saveAs(nameInputValue);
                    dispatch(
                      setDocument({
                        id: docId,
                        name: nameInputValue,
                        content: document.content,
                      })
                    );
                    closeSaveDocumentAsDialog();
                  }
                } else {
                  await save(selectedDocument.id);
                  dispatch(
                    setDocument({
                      content: document.content,
                      ...selectedDocument,
                    })
                  );
                  closeSaveDocumentAsDialog();
                }
              }}
            >
              Save
            </Button>
            <Button onPress={closeSaveDocumentAsDialog}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default CustomNavigationBar;
