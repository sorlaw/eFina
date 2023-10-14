import { StatusBar } from "expo-status-bar";
import { StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { setupDatabase, addItem, getItems } from "./DatabaseHelper";
import {
  FAB,
  Modal,
  Portal,
  Text,
  Button,
  PaperProvider,
  TextInput,
  List,
} from "react-native-paper";

export default function App() {
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState("");
  const [visible, setVisible] = React.useState(false);
  const [tgl, setTgl] = useState("");
  const [data, setData] = useState([]);
  const [num, setNum] = useState(5);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  };

  const hapusData = () => {
    const db = SQLite.openDatabase("keuangan.db");

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM pengeluaran`, [], (_, result) => {
        console.log(`All data deleted from pengeluaran`);
      });
    });
  };

  const hapusDatabase = async () => {
    const db = SQLite.openDatabase("keuangan.db");

    db.transaction((tx) => {
      tx.executeSql(`DROP TABLE IF EXISTS pengeluaran`, [], (_, result) => {
        console.log(`Table pengeluaran dropped successfully`);
      });
    });

    db._db.close();

    // Hapus file database dari sistem file
    const databaseFileURI = `${FileSystem.documentDirectory}SQLite/keuangan.db`;
    FileSystem.deleteAsync(databaseFileURI)
      .then(() => {
        console.log("Database deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting database:", error);
      });
  };

  const handleGetItems = () => {
    getItems(setData);

    console.log(data);
  };
  useEffect(() => {
    setupDatabase();
    handleGetItems();
  }, [num]);

  const handleAddItem = () => {
    const tahun = new Date().getFullYear();
    const bulan = new Date().getMonth() + 1;
    const hari = new Date().getDate();
    console.log(tahun, bulan, hari);
    setTgl(`${tahun}-${bulan}-${hari}`);
    addItem(nama, nominal, tgl, (insertedId) => {
      console.log("item dimasukkan :" + insertedId);
    });
    setNum(num + 1);
    hideModal();
  };

  let nomor = 1;
  const renderData = ({ item }) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          borderWidth: 1,
          padding: 10,
          margin: 10,
          borderRadius: 10,
        }}
      >
        <View style={{ justifyContent: "center", marginRight: "16%" }}>
          <Text>{nomor++}</Text>
        </View>
        <View style={{ marginRight: "40%" }}>
          <Text>{item.nama}</Text>
          <Text>{item.nominal}</Text>
        </View>

        <View style={{ justifyContent: "center" }}>
          <Text>{item.waktu}</Text>
        </View>
      </View>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderData}
          style={{ marginTop: "15%" }}
        />
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}
          >
            <TextInput
              mode="outlined"
              label="nama pengeluaran"
              style={{ marginBottom: 20 }}
              onChangeText={(val) => setNama(val)}
            />
            <TextInput
              mode="outlined"
              label="nominal"
              style={{ marginBottom: 20 }}
              onChangeText={(val) => setNominal(val)}
            />
            <Button mode="contained" onPress={handleAddItem}>
              Tambah
            </Button>
          </Modal>
        </Portal>
        <FAB icon="plus" style={styles.fab} onPress={showModal} />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
