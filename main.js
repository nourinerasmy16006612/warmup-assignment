const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================

// helper1 methdo to convert string form txt file total sec 

function timeToSeconds(timeStr) {
  // input =10:02:20 am --> array ["10:02:20", "am"]
  // ^^ splits based on space 
  timeStr = timeStr.trim(); //remeoves ay extra 
  const parts = timeStr.split(" ");
  const period = parts[1].toLowerCase(); // "am" or "pm"
 
  // tplit time part on :  ["10", "02", "20"]
  const timeParts = parts[0].split(":");
  let hours = parseInt(timeParts[0]);   // like Integer.parseInt() in java
  let minutes = parseInt(timeParts[1]);
  let seconds = parseInt(timeParts[2]);
 
  // covert h to military time
  if (period === "am" && hours === 12) hours = 0;
  if (period === "pm" && hours !== 12) hours += 12;
 
  // return total sec
  return hours * 3600 + minutes * 60 + seconds;
}

//helper2 same as ^^ cuz shift duration mafihash am / pm

function durationToSeconds(durationStr) {
  durationStr = durationStr.trim();
  const parts = durationStr.split(":");

  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseInt(parts[2]);

  return hours * 3600 + minutes * 60 + seconds;
}

//helper3 ha convert sec l duration 

function secondsToDuration(totalSeconds) {

    const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
 
  // padStart(2, "0") adds a zero if the num is 1 digit
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
 
return hours + ":" + mm + ":" + ss;}

function getShiftDuration(startTime, endTime) {
  const startSec = timeToSeconds(startTime);
  const endSec = timeToSeconds(endTime);
  const diffSec = endSec - startSec; 
  return secondsToDuration(diffSec);
}



// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {

  const startSec = timeToSeconds(startTime);
  const endSec = timeToSeconds(endTime);
 
  // delivery window in sec
  const deliveryStart = 8 * 3600;  //  h x sec/hours
  const deliveryEnd = 22 * 3600; 
 
  let idleSec = 0;
 
  // math min end sec cuz edges case what if someone STARTS and ENDS even b4 8am 
  if (startSec < deliveryStart) {
    idleSec += Math.min(endSec, deliveryStart) - startSec;
  }
 
  // math max same but AFTER deliv satrt
  if (endSec > deliveryEnd) {
    idleSec += endSec - Math.max(startSec, deliveryEnd);
  }
 
  return secondsToDuration(idleSec);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
  const shiftSec = durationToSeconds(shiftDuration);
  const idleSec = durationToSeconds(idleTime);
  const activeSec = shiftSec - idleSec;
  return secondsToDuration(activeSec);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {

  const dateParts = date.split("-");

  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);
 
 let quotaSec;

if (year === 2025 && month === 4 && day >= 10 && day <= 30) {
  quotaSec = 6 * 3600; 
} else {
  quotaSec = (8 * 3600) + (24 * 60);
}
 
  const activeSec = durationToSeconds(activeTime);
 
  return activeSec >= quotaSec;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
  const content = fs.readFileSync(textFile, "utf8");
  let lines = content.split("\n").filter(Boolean);
 
  for (let i = 0; i < lines.length; i++) {
    //cols is an array , kol comma fel txt file bet separate el elements 
    const cols = lines[i].split(",");
    // cols[0]=driverID, cols[2]=date, cols[9]=hasBonus
    if (cols[0].trim() === driverID.trim() && cols[2].trim() === date.trim()) {
      cols[9] = String(newValue); // update hasBonus column (index 9)
      lines[i] = cols.join(",");  // rebuild the line
      break; // stop after first match 
    }
  }
 
  fs.writeFileSync(textFile, lines.join("\n") + "\n", "utf8");
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {

  const content = fs.readFileSync(textFile, "utf8");
  const lines = content.split("\n").filter(Boolean);
 
  //  "4" / "04" --> 4
  const targetMonth = parseInt(month);
 
  let driverExists = false;
  let bonusCount = 0;
 
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(",");
    
    if (cols[0].trim() === driverID.trim()) {
      driverExists = true;
 
      // get month from date string "yyyy-mm-dd"
      const recordMonth = parseInt(cols[2].trim().split("-")[1]);
 
      if (recordMonth === targetMonth) {
        if (cols[9].trim() === "true") {
          bonusCount++;
        }
      }
    }
  }
 
  if (!driverExists) return -1;
 
  return bonusCount;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
  const content = fs.readFileSync(textFile, "utf8");
  const lines = content.split("\n").filter(Boolean);
 
  let totalSeconds = 0;
 
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols[0].trim() === driverID.trim()) {
      const recordMonth = parseInt(cols[2].trim().split("-")[1]);
      if (recordMonth === month) {
        totalSeconds += durationToSeconds(cols[7].trim());
      }
    }
  }
 
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
 
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
 
return hours + ":" + mm + ":" + ss;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
  // like i java sw2itch table bass bel ?:
  const tierAllowance = {
    1: 50, // Senior
    2: 20, // Regular
    3: 10, // Junior
    4: 3,  // Trainee
  };
 
  //  read basePay and tier from rateFile 
  const rateContent = fs.readFileSync(rateFile, "utf8");
  const rateLines = rateContent.split("\n").filter(Boolean);
 
  let basePay = 0;
  let tier = 0;
 
  for (let i = 0; i < rateLines.length; i++) {
    const cols = rateLines[i].split(",");
    // rateFile format: driverID, dayOff, basePay, tier
    if (cols[0].trim() === driverID.trim()) {
      basePay = parseInt(cols[2].trim());
      tier = parseInt(cols[3].trim());
      break;
    }
  }
 
  const actualSec = durationToSeconds(actualHours);
  const requiredSec = durationToSeconds(requiredHours);
 
  // if driver worked enough -> no deduction
  if (actualSec >= requiredSec) return basePay;
 
  // calc missing time in sec
  const missingTotalSec = requiredSec - actualSec;
 

  //convert to h
  const missingTotalHours = missingTotalSec / 3600;
 
  // if tier null aw undefined all = 0
  const allowance = tierAllowance[tier] || 0;
  const missingAfterAllowance = missingTotalHours - allowance;
 
  // If missing is within allowance → no deduction
  if (missingAfterAllowance <= 0) return basePay;
 
  // Only FULL hours count → floor (e.g., 1.67 → 1)
  const billableMissingHours = Math.floor(missingAfterAllowance);
 
  // calc deduction
  const deductionRatePerHour = Math.floor(basePay / 185);
  const salaryDeduction = billableMissingHours * deductionRatePerHour;
 
  const netPay = basePay - salaryDeduction;
 
  // can't go below 0
  return Math.max(0, netPay);
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
