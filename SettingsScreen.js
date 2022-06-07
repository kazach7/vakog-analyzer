import { signOut, updatePassword } from "firebase/auth";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Snackbar,
  Switch,
  TextInput,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "./firebase";
import { toggleAutoAnalysis } from "./store";

const SettingsScreen = ({ navigation }) => {
  const autoAnalysis = useSelector((state) => state.settings.autoAnalysis);
  const dispatch = useDispatch();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isLoadingInDialog, setIsLoadingInDialog] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [retypeNewPasswordValue, setRetypeNewPasswordValue] = useState("");
  const [isNewPasswordError, setIsNewPasswordError] = useState(false);
  const [isRetypeError, setIsRetypeError] = useState(false);

  const snackbarText = useRef();

  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log("Signed out");
        navigation.navigate("Login");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const dismissDialog = () => {
    setNewPasswordValue("");
    setRetypeNewPasswordValue("");
    setIsNewPasswordError(false);
    setIsRetypeError(false);
    setDialogVisible(false);
  };

  const handlePasswordChange = async () => {
    if (newPasswordValue.length === 0) {
      setIsNewPasswordError(true);
    } else if (newPasswordValue !== retypeNewPasswordValue) {
      setIsRetypeError(true);
    } else {
      setIsLoadingInDialog(true);
      setIsNewPasswordError(false);
      setIsRetypeError(false);
      try {
        const user = auth.currentUser;
        await updatePassword(user, newPasswordValue);
        setDialogVisible(false);
        setNewPasswordValue("");
        setRetypeNewPasswordValue("");
      } catch (error) {
        if (error.code === "auth/weak-password") {
          setIsNewPasswordError(true);
          snackbarText.current = "Password should be at least 6 characters";
          setSnackbarVisible(true);
        } else {
          snackbarText.current = "An error occurred. Please try again later.";
          setSnackbarVisible(true);
        }
        console.error(error);
      }
      setIsLoadingInDialog(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16 }}>
        You are logged in as{" "}
        <Text style={{ fontWeight: "bold" }}>{auth.currentUser.email}</Text>.
      </Text>
      <View
        style={{ display: "flex", flexDirection: "row", marginVertical: 20 }}
      >
        <Button
          mode="contained"
          style={{ width: 100, marginRight: 20 }}
          onPress={logout}
        >
          Sign out
        </Button>
        <Button
          mode="outlined"
          style={{ width: 200 }}
          onPress={() => setDialogVisible(true)}
        >
          Change password
        </Button>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 30,
        }}
      >
        <Text style={{ marginRight: 20, fontSize: 16 }}>Auto analysis</Text>
        <Switch
          value={autoAnalysis}
          onValueChange={() => dispatch(toggleAutoAnalysis())}
        />
      </View>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={dismissDialog}>
          <Dialog.Title>Change password</Dialog.Title>
          {isLoadingInDialog ? (
            <ActivityIndicator style={{ paddingVertical: 30 }} />
          ) : (
            <>
              <Dialog.Content>
                <TextInput
                  style={styles.textInput}
                  secureTextEntry={true}
                  label={"New password"}
                  value={newPasswordValue}
                  onChangeText={(text) => setNewPasswordValue(text)}
                  error={isNewPasswordError}
                />
                <TextInput
                  style={styles.textInput}
                  secureTextEntry={true}
                  label={"Retype new password"}
                  value={retypeNewPasswordValue}
                  onChangeText={(text) => setRetypeNewPasswordValue(text)}
                  error={isRetypeError}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={handlePasswordChange}>Change</Button>
                <Button onPress={dismissDialog}>Cancel</Button>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          style={{ backgroundColor: "#750000" }}
          action={{
            color: "white",
            label: "ok",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarText.current}
        </Snackbar>
      </Portal>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  textInput: {
    marginVertical: 5,
  },
});
