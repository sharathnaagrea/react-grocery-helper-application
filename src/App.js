import React, { useState, useEffect } from 'react';
import './App.css';
import Avatar from 'react-avatar';
import Grid from '@material-ui/core/Grid'

import MaterialTable from "material-table";
import axios from 'axios'
import Alert from '@material-ui/lab/Alert';

import { tableIcons } from './material.table.icons';


const api = axios.create({
  baseURL: `http://localhost:8081//api/v1`
})


function App() {

  var columns = [
    { title: "id", field: "id", hidden: true },
    { title: "Avatar", render: rowData => <Avatar maxInitials={1} size={40} round={true} name={rowData === undefined ? " " : rowData.itemName} /> },
    { title: "Item", field: "itemName" },
    { title: "Price", field: "price" },
    { title: "Category", field: "category" }
  ]
  const [data, setData] = useState([]); //table data

  //for error handling
  const [iserror, setIserror] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])

  useEffect(() => {
    api.get("/groceries")
      .then(res => {
        setData(res.data)
      })
      .catch(error => {
        console.log("Error While fectching groceries data")
      })
  }, [])

  const handleRowUpdate = (newData, oldData, resolve) => {
    //validation
    let errorList = []
    if (newData.itemName === "" || newData.itemName == undefined) {
      errorList.push("Please enter item name")
    }
    if (newData.price === "" || newData.price == undefined) {
      errorList.push("Please enter price")
    }
    if (newData.category === "" || newData.category == undefined) {
      errorList.push("Please enter category")
    }

    if (errorList.length < 1) {
      api.put("/grocery/" + parseInt(newData.id), newData)
        .then(res => {
          const dataUpdate = [...data];
          const index = oldData.tableData.id;
          dataUpdate[index] = newData;
          setData([...dataUpdate]);
          resolve()
          setIserror(false)
          setErrorMessages([])
        })
        .catch(error => {
          setErrorMessages(["Update failed! Server error"])
          setIserror(true)
          resolve()

        })
    } else {
      setErrorMessages(errorList)
      setIserror(true)
      resolve()

    }

  }

  const handleRowAdd = (newData, resolve) => {
    //validation
    let errorList = []

    console.log('newData : ' + newData);
    console.log('newData.itemName : ' + newData.itemName);
    console.log('newData.price : ' + newData.price);

    console.log('newData.category : ' + newData.category);

    if (newData.itemName === "" || newData.itemName == undefined) {
      errorList.push("Please enter item name")
    }


    if (newData.price === "" || newData.price == undefined) {
      errorList.push("Please enter price")
    }
    if (newData.category === "" || newData.category == undefined) {
      errorList.push("Please enter category")
    }


    if (errorList.length < 1) { //no error
      api.post("/add-grocery", newData)
        .then(res => {
          let dataToAdd = [...data];
          dataToAdd.push(newData);
          setData(dataToAdd);
          resolve()
          setErrorMessages([])
          setIserror(false)
        })
        .catch(error => {
          setErrorMessages(["Cannot add data. Server error!"])
          setIserror(true)
          resolve()
        })
    } else {
      setErrorMessages(errorList)
      setIserror(true)
      resolve()
    }


  }

  const handleRowDelete = (oldData, resolve) => {

    api.delete("/grocery/" + parseInt(oldData.id))
      .then(res => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve()
      })
      .catch(error => {
        setErrorMessages(["Delete failed! Server error"])
        setIserror(true)
        resolve()
      })
  }


  return (
    <div className="App">

      <Grid container spacing={1}>
        <Grid item xs={3}></Grid>
        <Grid item xs={6}>
          <div>
            {iserror &&
              <Alert severity="error">
                {errorMessages.map((msg, i) => {
                  return <div key={i}>{msg}</div>
                })}
              </Alert>
            }
          </div>
          <MaterialTable
            title="Grocery List"
            columns={columns}
            data={data}
            icons={tableIcons}
            editable={{
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve) => {
                  handleRowUpdate(newData, oldData, resolve);

                }),
              onRowAdd: (newData) =>
                new Promise((resolve) => {
                  console.log('newData Promise : ' + newData);
                  handleRowAdd(newData, resolve)
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve) => {
                  handleRowDelete(oldData, resolve)
                }),
            }}
          />
        </Grid>
        <Grid item xs={3}></Grid>
      </Grid>
    </div>
  );
}

export default App;