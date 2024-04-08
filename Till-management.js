"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var TillManagement = /** @class */ (function () {
    function TillManagement() {
    }
    TillManagement.main = function () {
        var amountInTill = new Map([
            [50, 5],
            [20, 5],
            [10, 6],
            [5, 12],
            [2, 10],
            [1, 10]
        ]);
        var items = [];
        var amountPaid = [];
        var line = "";
        try {
            var data = fs.readFileSync('input.txt', 'utf8');
            var lines = data.split(/\r?\n/);
            lines.forEach(function (line) {
                var values = line.split(',');
                items.push([values[0]]);
                amountPaid.push([values[1]]);
            });
        }
        catch (err) {
            console.error(err);
        }
        var total = TillManagement.getAmountsFromLists(items);
        var paidWith = TillManagement.getAmountsFromArray(amountPaid);
        TillManagement.processTransactions(amountInTill, total, paidWith);
    };
    TillManagement.getAmountsFromLists = function (rows) {
        var sums = [];
        var regExp = /\d+/;
        rows.forEach(function (row) {
            var sum = 0;
            row.forEach(function (str) {
                var matches = str.match(regExp);
                if (matches) {
                    sum += parseInt(matches[0]);
                }
            });
            sums.push(sum);
        });
        return sums;
    };
    TillManagement.getAmountsFromArray = function (rows) {
        var regExp = /\d+/;
        var amounts = [];
        rows.forEach(function (row) {
            var numberList = [];
            row.forEach(function (str) {
                var matches = str.match(regExp);
                if (matches) {
                    numberList.push(parseInt(matches[0]));
                }
            });
            amounts.push(numberList);
        });
        return amounts;
    };
    TillManagement.calculateTotalAmountInTill = function (amountInTill) {
        var totalAmountInTill = 0;
        amountInTill.forEach(function (count, denomination) {
            totalAmountInTill += denomination * count;
        });
        return totalAmountInTill;
    };
    TillManagement.updateTill = function (amountInTill, paidWith, transactionAmount) {
        var totalPaid = 0;
        var changeBreakdown = new Map();
        paidWith.forEach(function (denomination) {
            totalPaid += denomination;
        });
        var remainingChange = totalPaid - transactionAmount;
        for (var i = 0; i < paidWith.length && remainingChange > 0; i++) {
            var denomination = paidWith[i];
            var count = amountInTill.get(denomination) || 0;
            while (remainingChange >= denomination && count > 0) {
                remainingChange -= denomination;
                count--;
                changeBreakdown.set(denomination, (changeBreakdown.get(denomination) || 0) + 1);
            }
            count++;
            amountInTill.set(denomination, count);
        }
        return changeBreakdown;
    };
    TillManagement.processTransactions = function (amountInTill, transactions, paidWith) {
        try {
            var writer_1 = fs.createWriteStream('output.txt', { flags: 'a' });
            writer_1.write("Till Start, Transaction Total, Paid, Change Total, Change Breakdown\n");
            var totalAmountInTill_1 = TillManagement.calculateTotalAmountInTill(amountInTill);
            writer_1.write("R".concat(totalAmountInTill_1, ", "));
            transactions.forEach(function (transactionAmount, i) {
                totalAmountInTill_1 += transactionAmount;
                var paidWithCustomer = paidWith[i];
                var totalPaid = 0;
                paidWithCustomer.forEach(function (denomination) {
                    totalPaid += denomination;
                });
                var changeTotal = totalPaid - transactionAmount;
                var changeBreakdown = TillManagement.updateTill(amountInTill, paidWithCustomer, transactionAmount);
                writer_1.write("R".concat(transactionAmount, ", R").concat(totalPaid, ", R").concat(changeTotal, ", R"));
                changeBreakdown.forEach(function (count, denomination) {
                    for (var j = 0; j < count; j++) {
                        writer_1.write("".concat(denomination));
                        if (j < count - 1) {
                            writer_1.write("-");
                        }
                    }
                    if (denomination < Math.max.apply(Math, Array.from(changeBreakdown.keys()))) {
                        writer_1.write("-");
                    }
                });
                if (i < transactions.length - 1) {
                    writer_1.write("\nR" + totalAmountInTill_1 + ", ");
                }
            });
            writer_1.write("\nR".concat(totalAmountInTill_1, "\n"));
            writer_1.end();
        }
        catch (err) {
            console.error(err);
        }
    };
    return TillManagement;
}());
TillManagement.main();
