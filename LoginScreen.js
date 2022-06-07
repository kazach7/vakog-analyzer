import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Button,
  Headline,
  Portal,
  Snackbar,
  Subheading,
  TextInput,
} from "react-native-paper";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const snackbarText = useRef();

  function login() {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Signed in with " + user.email);
        setIsSignedIn(true);
      })
      .catch((error) => {
        snackbarText.current =
          error.code === "auth/invalid-email"
            ? "Provided e-mail is invalid"
            : "Login failed";
        console.error(error.code);
        setSnackbarVisible(true);
        setIsLoading(false);
      });
  }

  function register() {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Registered with " + userCredential.user.email);
        setIsSignedIn(true);
        setIsLoading(false);
      })
      .catch((error) => {
        snackbarText.current =
          error.code === "auth/invalid-email"
            ? "Provided e-mail is invalid"
            : error.code === "auth/weak-password"
            ? "The password doesn't meet the requirements"
            : "Failed to register user";
        console.error(error.code);
        setSnackbarVisible(true);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoading(true);
        setTimeout(() => {
          navigation.replace("Home");
        }, 1000);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size={"large"} />
      ) : (
        <View>
          <Subheading
            style={{ paddingBottom: 30, fontSize: 18, textAlign: "center" }}
          >
            Sign in using your e-mail address.
          </Subheading>
          <TextInput
            style={styles.input}
            mode="outlined"
            label="Email"
            value={email}
            placeholder={"example@domain.com"}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            style={styles.input}
            mode="outlined"
            label={"Password"}
            value={password}
            secureTextEntry={true}
            onChangeText={(text) => setPassword(text)}
          />
          <Button mode="contained" onPress={login} style={styles.button}>
            Login
          </Button>
          <Button mode="outlined" onPress={register} style={styles.button}>
            Register
          </Button>
        </View>
      )}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          style={{ backgroundColor: "#8b0000" }}
          action={{
            color: "white",
            label: "ok",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarText.current}
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 300,
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
});

export default LoginScreen;
