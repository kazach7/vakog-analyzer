import {
  faEarListen,
  faEye,
  faFingerprint,
  faWineGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Headline,
  List,
  Paragraph,
  Portal,
  Snackbar,
  Subheading,
  Text,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import {
  addIgnoredExpression,
  addIgnoredMapping,
  deleteMapping,
  deleteMappingsOfExpression,
} from "./store";

const MappingsView = ({ navigation, route }) => {
  const [mappingToDelete, setMappingToDelete] = useState(null);
  const dispatch = useDispatch();

  const snackbarText = useRef("");

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { mappings, counts } = useSelector((state) => state.mappings);
  const { suggestions } = useSelector((state) => state.suggestions);

  const sortedMappings = [...mappings].sort(function (a, b) {
    return a.start_offset - b.start_offset;
  });

  const listItems = sortedMappings.map((mapping, i) => (
    <List.Accordion
      title={mapping.matched_lemma}
      description={mapping.vakog}
      style={{ position: "relative", paddingHorizontal: 30 }}
      key={i}
      titleStyle={{ fontSize: 15 }}
      descriptionStyle={{ fontSize: 13 }}
      left={() => (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            marginRight: 5,
          }}
        >
          <FontAwesomeIcon
            icon={
              mapping.vakog === "visual"
                ? faEye
                : mapping.vakog === "auditory"
                ? faEarListen
                : mapping.vakog === "kinesthetic"
                ? faFingerprint
                : faWineGlass
            }
          />
        </View>
      )}
    >
      <>
        {/*Wrapping in <> to avoid left padding of the expandable content (it would inherit it from the parent).*/}
        <View style={{ paddingVertical: 15, paddingHorizontal: 30 }}>
          <Text style={{ marginBottom: 10, color: "grey" }}>
            Characters: {mapping.start_offset}-{mapping.end_offset - 1}
          </Text>
          <Text style={{ marginBottom: 10 }}>{mapping.sentence}</Text>
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
                onPress={() => setMappingToDelete(mapping)}
              >
                Delete
              </Button>
            </View>
          </View>
        </View>
      </>
    </List.Accordion>
  ));

  // useEffect(() => {}, [mappings]);

  const screenWidth = Dimensions.get("screen").width;

  const data = [
    { x: "V", y: counts["visual"], fill: "red" },
    { x: "A", y: counts["auditory"], fill: "blue" },
    { x: "K", y: counts["kinesthetic"], fill: "green" },
    {
      x: "OG",
      y: counts["olfactory and gustatory"],
      fill: "purple",
    },
  ];

  const suggestionsCount = suggestions.length;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Headline
          style={{ alignSelf: "center", fontWeight: "bold", paddingTop: 10 }}
        >
          VAKOG analysis results
        </Headline>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <VictoryChart
            animate={{ duration: 500 }}
            theme={VictoryTheme.material}
            domainPadding={10}
            width={screenWidth / 1.08}
            height={250}
          >
            <VictoryBar
              data={data}
              style={{
                data: {
                  fill: ({ datum }) => datum.fill,
                },
              }}
            />
          </VictoryChart>
        </View>
        <View
          style={{
            width: screenWidth / 1.2,
            alignSelf: "center",
          }}
        >
          <Subheading style={{ paddingBottom: 25, alignSelf: "center" }}>
            Recognized expressions:
          </Subheading>
          <Text style={styles.numberOfExpressions}>
            <FontAwesomeIcon icon={faEye} />
            {"  "}
            <Text style={{ fontWeight: "bold" }}> visual</Text>:{" "}
            {counts["visual"]}
          </Text>
          <Text style={styles.numberOfExpressions}>
            <FontAwesomeIcon icon={faEarListen} />
            {"  "}
            <Text style={{ fontWeight: "bold" }}> auditory</Text>:{" "}
            {counts["auditory"]}
          </Text>
          <Text style={styles.numberOfExpressions}>
            <FontAwesomeIcon icon={faFingerprint} />
            {"  "}
            <Text style={{ fontWeight: "bold" }}> kinesthetic</Text>:{" "}
            {counts["kinesthetic"]}
          </Text>
          <Text style={styles.numberOfExpressions}>
            <FontAwesomeIcon icon={faWineGlass} />
            {"  "}
            <Text style={{ fontWeight: "bold" }}> olfactory and gustatory</Text>
            : {counts["olfactory and gustatory"]}
          </Text>
          <Text style={{ paddingVertical: 25 }}>
            <Button
              mode={suggestionsCount ? "outlined" : "text"}
              onPress={() => {
                navigation.navigate("Suggestions");
              }}
              disabled={!suggestionsCount}
            >
              There are{" "}
              <Text style={{ fontWeight: "bold" }}>{suggestionsCount}</Text>{" "}
              edit suggestions
            </Button>
          </Text>
        </View>
        {listItems}
      </ScrollView>
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: "ok",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarText.current}
        </Snackbar>
        <Dialog
          visible={mappingToDelete != null}
          onDismiss={() => {
            setMappingToDelete(null);
          }}
        >
          <Dialog.Title>Delete</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Delete each occurrence of this expression?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Text style={{ marginBottom: "1%" }}>
              <Button
                compact={true}
                onPress={() => {
                  dispatch(
                    deleteMappingsOfExpression(mappingToDelete.matched_lemma)
                  );
                  dispatch(addIgnoredExpression(mappingToDelete.matched_lemma));
                  setMappingToDelete(null);
                  snackbarText.current = "Mappings deleted";
                  setSnackbarVisible(true);
                }}
              >
                Delete all
              </Button>
              <Button
                compact={true}
                onPress={() => {
                  dispatch(deleteMapping(mappingToDelete));
                  dispatch(
                    addIgnoredMapping({
                      expression: mappingToDelete.matched_lemma,
                      vakog: mappingToDelete.vakog,
                      sentence: mappingToDelete.sentence,
                    })
                  );
                  setMappingToDelete(null);
                  snackbarText.current = "Mapping deleted";
                  setSnackbarVisible(true);
                }}
              >
                Delete only this
              </Button>
              <Button
                compact={true}
                onPress={() => {
                  setMappingToDelete(null);
                }}
              >
                Cancel
              </Button>
            </Text>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  numberOfExpressions: {
    fontSize: 17,
    paddingBottom: 7,
  },
});

export default MappingsView;
