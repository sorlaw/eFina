import { StatusBar } from "expo-status-bar";
import { StyleSheet, TouchableOpacity, View, FlatList, ImageBackground } from "react-native";
import Bg from "./assets/bg.jpg"
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
  IconButton,
  MD3Colors,
  ActivityIndicator
} from "react-native-paper";
import * as Print from 'expo-print';





export default function App() {
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState("");
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const tahun = new Date().getFullYear();
  const bulan = new Date().getMonth() + 1;
  const hari = new Date().getDate();
  const containerStyle = {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  };
  let nomor = 1;
  let nomor2 = 1;
  const print = async () => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html,
    }).then(() => {

      handleGetItems();
    });

  };
  const html = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
  </head>
  <body style="text-align: center;">
    <h1 class="text-success">
      Total Pengeluaran 
    </h1>
    <div class="container mt-3">
        <table class="table table-bordered border-primary">
            <thead>
              <tr>
                <th scope="col">No</th>
                <th scope="col">Nama Pengeluaran</th>
                <th scope="col">Nominal</th>
                <th scope="col">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((val) =>
    `<tr>
                <td>${nomor2++}</td>
                <td>${val.nama}</td>
                <td>${val.nominal}</td>
                <td>${val.waktu}</td>
              </tr>`

  )}
              
            </tbody>
            <tfooter>
            <tr>
            <td colspan="2">
            Total Pengeluaran :
            </td>
            <td colspan="2">
            ${data.length > 0 ? data.map((val) => parseInt(val.nominal)).reduce((total, num) => total + num) : ""}
            </td>
            </tr>
            </tfooter>
          </table>
    </div>
  </body>
</html>`;


  const hapusData = () => {
    const db = SQLite.openDatabase("keuangan.db");

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM pengeluaran`, [], (_, result) => {
        console.log(`All data deleted from pengeluaran`);
      });
    });
    handleGetItems()
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

  const handleSelectedDelete = (id) => {
    const db = SQLite.openDatabase("keuangan.db");

    db.transaction((tx) => {
      tx.executeSql("DELETE FROM pengeluaran WHERE id = ?", [id]);
    })
    handleGetItems()
  }

  const handleGetItems = () => {
    nomor = 1;
    getItems(setData);
  };

  useEffect(() => {
    setupDatabase();
    handleGetItems();

  }, []);

  useEffect(() => {
    nomor = 1
  });


  const handleAddItem = () => {

    hideModal();
    console.log(tahun, bulan, hari);
    const tanggal = `${tahun}-${bulan}-${hari}`;
    addItem(nama, nominal, tanggal, (insertedId) => {
      console.log("item dimasukkan :" + insertedId);
    });

    handleGetItems();

  };


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
          borderColor: 'white'
        }}
      >
        <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: "center", }}>
          <Text style={{ color: 'white' }}>{nomor++}</Text>
        </View>
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>{item.nama}</Text>
        </View>
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', }}>{item.nominal}</Text>
        </View>

        <View style={{ justifyContent: "center", flexGrow: 1, alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>{item.waktu}</Text>
        </View>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelectedDelete(item.id)}>
          <IconButton
            icon="trash-can"
            iconColor={MD3Colors.error50}
            size={20}
            onPress={() => handleSelectedDelete(item.id)}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PaperProvider>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ImageBackground source={Bg} resizeMode="cover" style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ color: 'white', marginTop: '10%', marginLeft: '3%' }} variant="bodyLarge" >Total Pengeluaran :
            {data.length > 0 ? data.map((val) => parseInt(val.nominal)).reduce((total, num) => total + num) : ""}
          </Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderData}
            style={{ marginTop: "2%" }}
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
                keyboardType="numeric"
              />
              <Button mode="contained" onPress={handleAddItem}>
                Tambah
              </Button>

            </Modal>
          </Portal>
          <FAB icon="plus" style={styles.fab} onPress={showModal} rippleColor={'#000000'} />
          <FAB icon="trash-can" style={styles.sec} onPress={hapusData} color="white" />
          <FAB icon="printer" style={styles.thr} onPress={print} color="white" />

        </ImageBackground>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  sec: {
    position: "absolute",
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: 'red',
  },
  thr: {
    position: "absolute",
    margin: 16,
    left: '40%',
    bottom: 0,
    backgroundColor: 'blue',
  },

});
