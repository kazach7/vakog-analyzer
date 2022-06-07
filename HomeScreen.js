import { faA, faG, faK, faO, faV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import QuillEditor, { QuillToolbar } from "react-native-cn-quill";
import { Button, Portal, Snackbar, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  setDocumentContent,
  setIsAnalysing,
  setMappings,
  setSuggestions,
} from "./store";

const HomeScreen = ({ navigation }) => {
  const richText = useRef();

  const analysisTimeout = useRef();

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const isAnalysing = useSelector((state) => state.settings.isAnalysing);

  const autoAnalysis = useSelector((state) => state.settings.autoAnalysis);

  const vakogCounts = useSelector((state) => state.mappings.counts);
  const suggestionsToApply = useSelector(
    (state) => state.suggestions.suggestionsToApply
  );

  const documentId = useSelector((state) => state.document.id);
  const documentContent = useSelector((state) => state.document.content);
  const ignoredMappings = useSelector(
    (state) => state.document.ignoredMappings
  );
  const ignoredExpressions = useSelector(
    (state) => state.document.ignoredExpressions
  );
  const ignoredSuggestions = useSelector(
    (state) => state.document.ignoredSuggestions
  );

  const lastAppliedSuggestions = useRef([]);

  const dispatch = useDispatch();

  const onTextChange = async () => {
    dispatch(setDocumentContent(await richText.current.getContents()));
    if (autoAnalysis) {
      clearTimeout(analysisTimeout.current);
      analysisTimeout.current = setTimeout(sendToAnalysis, 1200);
    }
  };

  /* NOTE: useCallback, poniewaz jezeli jest bez tego, to timeout zapisany w analysisTimeout (useRef) zapamietuje sobie stary stan funkcji sendToAnalysis bez uwzgledniania zmian w ignoredMappings itp. */
  const sendToAnalysis = useCallback(async () => {
    if (isAnalysing) {
      return;
    }

    dispatch(setIsAnalysing(true));

    const text = await richText.current.getText();

    if (text.trim().length > 0) {
      try {
        let response = await fetch("http://192.168.161.141:5000/analyze", {
          method: "POST",
          body: JSON.stringify(text),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const mappingsJson = await response.json();
        console.log("mappingsJson: " + JSON.stringify(mappingsJson));

        console.log("ignoredMappings: " + JSON.stringify(ignoredMappings));

        const mappings = mappingsJson.filter((m) => {
          if (ignoredExpressions.includes(m.matched_lemma)) {
            console.log(
              "Mapping filtered out by expression: " + JSON.stringify(m)
            );
            return false;
          }
          for (let im of ignoredMappings) {
            if (
              im.expression == m.matched_lemma &&
              im.vakog == m.vakog &&
              im.sentence == m.sentence
            ) {
              console.log("Mapping filtered out: " + JSON.stringify(m));
              ex;
              return false;
            }
          }
          return true;
        });

        dispatch(setMappings(mappings));

        response = await fetch("http://192.168.161.141:5000/suggestions", {
          method: "POST",
          body: JSON.stringify(text),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const suggestionsJson = await response.json();

        console.log("suggestionsJson: " + suggestionsJson);

        const suggestions = suggestionsJson.filter((s) => {
          for (let is of ignoredSuggestions) {
            if (
              is.target == s.target &&
              is.candidate == s.candidate &&
              is.sentence == s.sentence
            ) {
              console.log("Suggestion filtered out: " + JSON.stringify(s));
              return false;
            }
          }
          return true;
        });

        dispatch(setSuggestions(suggestions));
      } catch (error) {
        console.error(error);
        setSnackbarVisible(true);
      }
    } else {
      dispatch(setMappings([]));
      dispatch(setSuggestions([]));
    }
    dispatch(setIsAnalysing(false));
  }, []);

  async function replace(offset, target, candidate) {
    const delta = [
      { retain: offset },
      { delete: target.length },
      { insert: candidate },
    ];
    richText.current.updateContents(delta);
  }

  useEffect(() => {
    richText.current.setContents(documentContent);
  }, [documentId]);

  const [aaaColor, setAaaaColor] = useState("white");

  if (lastAppliedSuggestions.current != suggestionsToApply) {
    for (const s of suggestionsToApply) {
      replace(s.offset, s.target, s.candidate);
    }
    lastAppliedSuggestions.current = suggestionsToApply;
  }

  return (
    <SafeAreaView style={styles.root}>
      <View
        onTouchStart={() => setAaaaColor("lightgrey")}
        onTouchEnd={() => {
          navigation.navigate("Mappings");
          setAaaaColor("white");
        }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          // flex: 1,
          display: "flex",
          flexDirection: "row",
          backgroundColor: aaaColor,
          borderBottomWidth: 2,
          borderBottomColor: "lightgrey",
          shadowRadius: 10,
          marginBottom: 5,
        }}
      >
        <View style={styles.vakogCounter}>
          <Text style={[styles.vakogCounterText, { color: "red" }]}>
            <FontAwesomeIcon icon={faV} color="red" /> — {vakogCounts["visual"]}
          </Text>
        </View>
        <View style={styles.vakogCounter}>
          <Text style={[styles.vakogCounterText, { color: "blue" }]}>
            <FontAwesomeIcon icon={faA} color="blue" /> —{" "}
            {vakogCounts["auditory"]}
          </Text>
        </View>
        <View style={styles.vakogCounter}>
          <Text style={[styles.vakogCounterText, { color: "green" }]}>
            <FontAwesomeIcon icon={faK} color="green" /> —{" "}
            {vakogCounts["kinesthetic"]}
          </Text>
        </View>
        <View style={styles.vakogCounter}>
          <Text style={[styles.vakogCounterText, { color: "purple" }]}>
            <FontAwesomeIcon icon={faO} color="purple" />
            <FontAwesomeIcon icon={faG} color="purple" /> —{" "}
            {vakogCounts["olfactory and gustatory"]}
          </Text>
        </View>
      </View>
      <Portal>
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
          Failed to analyze. Please try again later.
        </Snackbar>
      </Portal>
      {autoAnalysis ? null : (
        <>
          {isAnalysing ? (
            <Button mode="contained" loading={true}>
              Analyzing...
            </Button>
          ) : (
            <Button mode="contained" icon="reload" onPress={sendToAnalysis}>
              Analyze
            </Button>
          )}
        </>
      )}
      <QuillEditor
        ref={richText}
        style={styles.editor}
        onTextChange={onTextChange}
      />
      <QuillToolbar editor={richText} options="full" theme="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#eaeaea",
  },
  editor: {
    flex: 1,
    padding: 0,
    borderColor: "gray",
    borderWidth: 1,
    marginHorizontal: 30,
    marginVertical: 5,
    backgroundColor: "white",
  },
  vakogCounter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vakogCounterText: {
    fontSize: 19,
  },
});

export default HomeScreen;
