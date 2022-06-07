import { View, ScrollView } from "react-native";
import React, { useRef, useState } from "react";
import { List, Button, Text, Portal, Snackbar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  addIgnoredSuggestion,
  applyAllSuggestions,
  applySuggestion,
  ignoreSuggestion,
} from "./store";

const SuggestionsView = ({ navigation, route }) => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const snackbarText = useRef("");

  const suggestions = useSelector((state) => state.suggestions.suggestions);

  const dispatch = useDispatch();

  return (
    <ScrollView>
      <Button
        style={{ alignSelf: "flex-end", margin: 10 }}
        mode="contained"
        disabled={!suggestions.length}
        onPress={() => {
          dispatch(applyAllSuggestions());
          snackbarText.current = "Suggestions applied";
          setSnackbarVisible(true);
        }}
      >
        Apply all
      </Button>
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{ label: "ok", onPress: () => setSnackbarVisible(false) }}
        >
          {snackbarText.current}
        </Snackbar>
      </Portal>
      {suggestions.map((s, i) => (
        <List.Accordion
          title={
            <Text>
              {s.target} <FontAwesomeIcon icon={faArrowRight} size={14} />
              {"  "}
              {s.candidate}
            </Text>
          }
          key={i}
        >
          <>
            <View style={{ paddingVertical: 15, paddingHorizontal: 30 }}>
              <Text style={{ marginBottom: 10, color: "grey" }}>
                Replace <Text style={{ fontStyle: "italic" }}>{s.target}</Text>{" "}
                with <Text style={{ fontStyle: "italic" }}>{s.candidate}</Text>{" "}
                in:
              </Text>
              <Text style={{ marginVertical: 10 }}>
                {s.sentence.slice(0, s.offset - s.sentence_offset)}
                <Text style={{ fontWeight: "bold" }}>{s.target}</Text>
                {s.sentence.slice(
                  s.offset - s.sentence_offset + s.target.length
                )}
              </Text>
              <View
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <Button
                    mode="text"
                    compact={true}
                    style={{ marginRight: "1%" }}
                    onPress={() => {
                      dispatch(applySuggestion({ suggestion: s, i: i }));
                      snackbarText.current = "Suggestion applied";
                      setSnackbarVisible(true);
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    mode="text"
                    compact={true}
                    onPress={() => {
                      dispatch(ignoreSuggestion(i));
                      dispatch(
                        addIgnoredSuggestion({
                          target: s.target,
                          candidate: s.candidate,
                          sentence: s.sentence,
                        })
                      );
                      snackbarText.current = "Suggestion removed";
                      setSnackbarVisible(true);
                    }}
                  >
                    Ignore
                  </Button>
                </View>
              </View>
            </View>
          </>
        </List.Accordion>
      ))}
    </ScrollView>
  );
};

export default SuggestionsView;
