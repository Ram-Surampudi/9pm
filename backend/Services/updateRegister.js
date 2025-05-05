
const MoneyRegister = require("../Schemas/MoneyRegister.js");
const Records = require("../Schemas/Records.js");
const Users = require("../Schemas/user.js");

const searchMonth = (year, month, reg) =>{
    let start =0, end = reg.length -1, mid =0;

    while(start <= end){
        mid = (start + end) >> 1;
        if(reg[mid].year === year && reg[mid].month === month){
            return {index: mid, isFound:true};
        }
        else if(reg[mid].year < year || ( reg[mid].year === year && reg[mid].month < month)){
            start = mid + 1;
        }   
        else{
            end = mid - 1;
        }
    }
    return {index: start, isFound:false};
}
const sort = (arr) =>{
    if(!arr) return;
    arr.sort((a,b)=>{
        if(a.year == b.year){
         return a.month - b.month;
        }
       return a.year - b.year;
      });
}
const addToOperations = (operations, data) =>{ 
    operations.push({
        updateOne: {
            filter: { _id:data._id },  
            update: { $set: data},
        }
    });
}

const updateTransactions = (prevBal , record) =>{
    if(!record || record?.transactions?.length < 1) return;
    const {transactions} = record;
    transactions[0].balance = ((transactions[0]?.credit || 0) + prevBal) - transactions[0]?.debit || 0; 
    for(var j =1; j < transactions.length; j++){
        transactions[j].balance = (transactions[j-1].balance - (transactions[j]?.debit || 0)) + transactions[j]?.credit || 0;
    }
    record.transactions = transactions; 
    record.balance = transactions[transactions.length-1].balance;
}

const Register = async (record, user) =>{
    let money_credited =0, usage =0 , cats = {};
  
    let {month, year, transactions} = record; 

    const currentUser = await Users.findById({_id:user});
    var reg = await MoneyRegister.find({user});
    sort(reg);
    const {catetories, initialAmount} = currentUser;

    if(!transactions) transactions = [];

    transactions.forEach(item=>{
        money_credited += item.credit;
        usage += item.debit;
        for(let category of catetories){
            if(item.category === category){
                if(!cats[category]) cats[category] = 0;
                cats[category] += item.debit;
                break;
            }
        }
    });
    
    let {index, isFound} = searchMonth(year, month, reg);
    var balance =0 , prevBalance =0;
    prevBalance = index == 0 ? initialAmount : reg[index-1].balance;
    balance = (money_credited - usage + prevBalance);
    const mr_reg = isFound ? reg[index].set({...reg[index], balance, money_credited, usage,catetories :cats}) : new MoneyRegister({month ,year, balance, money_credited, usage,catetories :cats, user});
    
    if(transactions.length > 0){
        await mr_reg.save();
    }

   let oldRecordBalance = record.balance;
    operations = [];
    
    updateTransactions(prevBalance, record);

    if(transactions.length > 0){
        await record.save();
    }

    if(index < reg.length -1 && oldRecordBalance !== record.balance){
        var newRecords = await Records.find({user});
        sort(newRecords);
        let prevBal = record.balance;
        for(var i = isFound ? index+1 : index ; i < newRecords.length; i++){
            updateTransactions(prevBal, newRecords[i]);
            addToOperations(operations, new Records(newRecords[i]));          
            prevBal = newRecords[i].balance;
        }
        try{
            if(operations)
                await Records.bulkWrite(operations);
        }
        catch(err){
            console.log("second error");
            console.log(err);
        }
    }

    var operations = [];
    let preMr = mr_reg;

    if(index < reg.length -1 && oldRecordBalance !== record.balance){
        for(var i = isFound ? index+1 : index ; i<reg.length; i++){
            reg[i].balance = (reg[i].money_credited - reg[i].usage) + preMr.balance;
            addToOperations(operations, new MoneyRegister(reg[i]));
            preMr = reg[i];
        }
        try{
        if(operations)
            await MoneyRegister.bulkWrite(operations);
    }
    catch(err){
        console.log("fist error");
        
        console.log(err);
    }
    }

    if(transactions.length < 1){
        await MoneyRegister.deleteOne({_id:mr_reg._id});
        await Records.deleteOne({_id:record._id});
    }
    if(transactions.length > 0 && !currentUser.years.includes(year)){
        currentUser.years = [...currentUser.years, year];
        await currentUser.save();
    }
  }

  module.exports = { Register, sort };