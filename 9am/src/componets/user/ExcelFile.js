import axios from "axios";
import { URL } from "../../App";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getFromStore } from "../cookies/cookies";

export const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const helper =(worksheet, iterater, key, val, I, J, K)=>{
  const vlaueCells = worksheet.getCell(I+iterater);
      worksheet.mergeCells(`${I+iterater}:${J+iterater}`);
      vlaueCells.value = key;
      vlaueCells.font = { size: 20 , color: { argb: "00000000" },  name: "Bahnschrift Condensed" };
      vlaueCells.height = 28;
      vlaueCells.alignment = { horizontal: "right", vertical: "middle" };
      vlaueCells.border = {
        // top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      const kCell = worksheet.getCell(K+iterater);
      kCell.value = val;
      kCell.font = { size: 20 , color: { argb: "00000000" },  name: "Bahnschrift Condensed" };
      kCell.numFmt = '#,##0'
      kCell.alignment = { horizontal: "left", vertical: "middle" };
      kCell.height = 28;
      kCell.border = {
        // top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
}

const updateAnualYears = (Ayears, item, startMonth) => {
  const year = item.month >= startMonth ? item.year : item.year - 1;
  if(!Ayears[year]) Ayears[year] = item.usage;
  else Ayears[year] += item.usage;
}

const addRegisterPage = (workbook, register) => {

  const worksheet = workbook.addWorksheet("REGISTER");

  worksheet.mergeCells("A1:F1");
  const headerCell = worksheet.getCell("A1");
  headerCell.value = "MONEY REGISTER";
  headerCell.font = { size: 28, color: { argb: "FF70AD47" } ,  name: "Bahnschrift Condensed" };
  headerCell.alignment = { horizontal: "center", vertical: "middle" };

  let tmc =0, tu=0, Ayears ={};
  let userIdata = getFromStore("user");
  let catetories = userIdata.catetories || [];
  let startMonth = userIdata.startMonth|| 8;
  
  let catValues = new Array(catetories.length).fill(0);

  register.forEach(item=>{
      tmc += item.money_credited;
      tu += item.usage;
      if(item.catetories){
        catetories.forEach((cat, index) => {
            if(item.catetories[cat])
                catValues[index] += item.catetories[cat];
          })
      }
      updateAnualYears(Ayears, item, startMonth);
  });

  worksheet.mergeCells("A2:C2");
  worksheet.addRow([]);
  worksheet.getCell("A2").value = "TOTAL MONEY CREDITED : ";
  worksheet.getCell("A2").height = 30;
  worksheet.getCell("A2").font = { size: 22,  name: "Bahnschrift Condensed" };
  worksheet.getCell("A2").alignment = { horizontal: "right", vertical: "middle" };
  worksheet.getCell("D2").value = tmc;
  worksheet.getCell("D2").numFmt = '#,##0'
  worksheet.getCell("D2").height = 30;
  worksheet.getCell("D2").font = { size: 22,  name: "Bahnschrift Condensed" };
  worksheet.getCell("D2").alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("A3:C3");
  worksheet.getCell("A3").value = "TOTAL USAGE : ";
  worksheet.getCell("A3").height = 30;
  worksheet.getCell("A3").font = { size: 22,  name: "Bahnschrift Condensed" };
  worksheet.getCell("A3").alignment = { horizontal: "right", vertical: "middle" };
  worksheet.getCell("D3").value = tu;
  worksheet.getCell("D3").numFmt = '#,##0'
  worksheet.getCell("D3").height = 30;
  worksheet.getCell("D3").font = { size: 22,  name: "Bahnschrift Condensed" };
  worksheet.getCell("D3").alignment = { horizontal: "left", vertical: "middle" };


  worksheet.addRow([]);
  const headers = ["YEAR", "MONTH", "MONEY CREDITED",...catetories.map(item=>item.toUpperCase()) , "USAGE", "BALANCE"];
  const headerRow = worksheet.addRow(headers);

  // // Style headers
  headerRow.eachCell(cell=>{
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } };
      cell.font = { size: 20,  name: "Bahnschrift Condensed", color: { argb: "FFFFFFFF" } };
  })
  headerRow.height = 30;
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  register.forEach((transaction) => {
    const row = worksheet.addRow([
      transaction.year,
      MONTHS[transaction.month -1],
      transaction.money_credited,
      ...catetories.map((cat) => {
        if(transaction.catetories && transaction.catetories[cat])
            return transaction.catetories[cat];
          return 0;
      }),
      transaction.usage,
      transaction.balance,
    ]);
    row?.eachCell((cell, colIndex) => {
      cell.border = {
        // top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if(colIndex > 1)
          cell.numFmt = '#,##0'
    });
    row.alignment = { horizontal: "center", vertical: "middle" };
    row.font = { size: 20,  name: "Bahnschrift Condensed" };
    row.height = 25;
  });

  // // Set column widths
  worksheet.columns = [
    { width: 13 }, // A
    { width: 24 }, // B
    { width: 25 }, // C
    ...catetories.map((cat) =>{return { width: 25 }}),
    { width: 17 }, // D
    { width: 17 }, // E

    { width: 6 },  // G
    { width: 6 },  // H
    { width: 20 },  // I
    { width: 15 },  // J
    { width: 15 },  // K
  ];

  let alpha = 72 + catetories.length;
  const I = String.fromCharCode(alpha);
  const J = String.fromCharCode(alpha+1);
  const K = String.fromCharCode(alpha+2);

  worksheet.mergeCells(`${I}5:${K}5`);
  const catCell = worksheet.getCell(`${I}5`);
  catCell.value = "CATEGORICAL DATA";
  catCell.height = 30;
  catCell.font = { size: 20 , color: { argb: "ffffffff" },  name: "Bahnschrift Condensed" };
  catCell.alignment = { horizontal: "center", vertical: "middle" };
  catCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "00000000" } };

  let iterater  = 6;
  for(let i = 0; i < catetories.length; i++){
     helper(worksheet, iterater, catetories[i].toUpperCase() + " : ", catValues[i], I, J, K);
    iterater++;
  }
  iterater += 3;

  worksheet.mergeCells(`${I+iterater}:${K+iterater}`);
  const annuval = worksheet.getCell(I+iterater++);
  annuval.value = "ANNUAL SPENT MONEY";
  annuval.font = { size: 20 , color: { argb: "ffffffff" }, name: "Bahnschrift Condensed" };
  annuval.height = 30;
  annuval.alignment = { horizontal: "center", vertical: "middle" };
  annuval.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "00000000" } };

  for(const key in Ayears){
    let start = MONTHS[startMonth-1], end = MONTHS[(startMonth == 1 ? 12 : startMonth-1)-1];
    
    let key1 = `${key} ${start?.substring(0,3)} - ${+key+1} ${end?.substring(0,3)} : `;
    helper(worksheet, iterater, key1, Ayears[key], I, J, K);
      iterater++;
    }
    helper(worksheet, iterater, "NET AMOUNT PAID : ", tu, I, J, K);
    iterater++;

  return workbook;
}

export const downloadExcel = async () => {
    
    
    const convertTxt = (item) => parseInt(item) === 0 || !item ? '-' : String(item);

    var data = [], register = [];
    try{
        const res = await axios.get(`${URL}/api/mr/excelfile`, {headers: {authorization: getFromStore("information")}});
        data = res.data.records;
        register = res.data.register;
    }
    catch(error){
        console.log(error);
        return;
    }

    const workbook = new ExcelJS.Workbook();
    // Iterate through sheets in data
    for (var i = data.length -1; i >=0; i--) {
      const sheetData = data[i];
      const worksheet = workbook.addWorksheet(`${MONTHS[sheetData.month-1]} ${sheetData.year}`);


    // Add workbook properties
    workbook.creator = "9Am";
    workbook.created = new Date();

      // Add header row
      worksheet.mergeCells("A1:F1");
      const headerCell = worksheet.getCell("A1");
      headerCell.value = MONTHS[sheetData.month-1] + " MONTH " + sheetData.year;
      headerCell.font = { size: 28 , color: { argb: "FF70AD47" },  name: "Bahnschrift Condensed" };
      headerCell.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.addRow([]);
      worksheet.getCell("B2").value = "TOTAL USAGE : ";
      worksheet.getRow(1).height = 35;
      worksheet.getRow(2).height = 28;
      worksheet.getCell("B2").font ={ size: 20 , color: { argb: "00000000" },  name: "Bahnschrift Condensed" };
      worksheet.getCell("B2").alignment = { horizontal: "right", vertical: "middle" };
      worksheet.getCell("C2").value = register[i].usage;
      worksheet.getCell("C2").font = { size: 20 , color: { argb: "00000000" },  name: "Bahnschrift Condensed" };
      worksheet.getCell("C2").numFmt = '#,##0'
      worksheet.getCell("C2").alignment = { horizontal: "left", vertical: "middle" };


      worksheet.addRow([]);
      // Add table headers
      const headers = ["DATE", "DESCRIPTION", "QUANTITY", "CREDIT", "DEBIT", "BALANCE"];
      const headerRow = worksheet.addRow(headers);

      // Style headers
      headerRow.font = { size: 20 , color: { argb: "FFFFFFFF" },  name: "Bahnschrift Condensed" };
      headerRow.eachCell(cell=>{
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "00000000" } };
      })
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 30;

      // Add transaction data
      sheetData.transactions.forEach((transaction) => {
        const row = worksheet.addRow([
        //   convertToDate(transaction.date),
        String(new Date(transaction.date).getDate()).padStart(2, '0')+ '-' + String(sheetData.month)?.padStart(2, '0') + '-'+ sheetData.year,
          transaction.description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          convertTxt(transaction?.quantity),
          convertTxt(transaction?.credit),
          convertTxt(transaction?.debit),
          transaction.balance,
        ]);
        row.eachCell((cell, colIndex) => {
          // if (colIndex === 1 && transaction.description.includes("Money Credited")) {
          //   cell.font = { color: { argb: "FFFF0000" } }; // Highlight "Money Credited" in red
          // }

          cell.border = {
            // top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          if(colIndex > 2 && cell.value !== '-'){
              cell.numFmt = '#,##0'
          }
        });
        row.alignment = { horizontal: "center", vertical: "middle" };
        row.font = { size: 18 , color: { argb: "00000000" },  name: "Bahnschrift Condensed" };
        row.height = 25;
      });

      // Set column widths
      worksheet.columns = [
        { width: 20 }, // DATE
        { width: 30 }, // DESCRIPTION
        { width: 17 }, // QUANTITY
        { width: 17 }, // DEBIT
        { width: 17 }, 
        { width: 17 }, 
      ];
    }

    addRegisterPage(workbook, register);

    // Generate and save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "9AM.xlsx");
  };