import * as fs from 'fs';

class TillManagement {
    static main() {
        const amountInTill: Map<number, number> = new Map([
            [50, 5],
            [20, 5],
            [10, 6],
            [5, 12],
            [2, 10],
            [1, 10]
        ]);

        let items: string[][] = [];
        let amountPaid: string[][] = [];
        let line: string = "";

        try {
            const data: string = fs.readFileSync('input.txt', 'utf8');
            const lines: string[] = data.split(/\r?\n/);
            lines.forEach(line => {
                const values: string[] = line.split(',');
                items.push([values[0]]);
                amountPaid.push([values[1]]);
            });
        } catch (err) {
            console.error(err);
        }

        const total: number[] = TillManagement.getAmountsFromLists(items);
        const paidWith: number[][] = TillManagement.getAmountsFromArray(amountPaid);

        TillManagement.processTransactions(amountInTill, total, paidWith);
    }

    static getAmountsFromLists(rows: string[][]): number[] {
        const sums: number[] = [];

        const regExp: RegExp = /\d+/;

        rows.forEach(row => {
            let sum: number = 0;
            row.forEach(str => {
                const matches: RegExpMatchArray | null = str.match(regExp);
                if (matches) {
                    sum += parseInt(matches[0]);
                }
            });
            sums.push(sum);
        });

        return sums;
    }

    static getAmountsFromArray(rows: string[][]): number[][] {
        const regExp: RegExp = /\d+/;
        const amounts: number[][] = [];

        rows.forEach(row => {
            const numberList: number[] = [];
            row.forEach(str => {
                const matches: RegExpMatchArray | null = str.match(regExp);
                if (matches) {
                    numberList.push(parseInt(matches[0]));
                }
            });
            amounts.push(numberList);
        });

        return amounts;
    }

    static calculateTotalAmountInTill(amountInTill: Map<number, number>): number {
        let totalAmountInTill: number = 0;
        amountInTill.forEach((count, denomination) => {
            totalAmountInTill += denomination * count;
        });
        return totalAmountInTill;
    }

    public static updateTill(amountInTill: Map<number, number>, paidWith: number[], transactionAmount: number): Map<number, number> {
        let totalPaid: number = 0;
        const changeBreakdown: Map<number, number> = new Map();
    
        paidWith.forEach(denomination => {
            totalPaid += denomination;
        });
    
        let remainingChange: number = totalPaid - transactionAmount;
    
        for (let i = 0; i < paidWith.length && remainingChange > 0; i++) {
            const denomination: number = paidWith[i];
            let count: number = amountInTill.get(denomination) || 0;
    
            while (remainingChange >= denomination && count > 0) {
                remainingChange -= denomination;
                count--;
                changeBreakdown.set(denomination, (changeBreakdown.get(denomination) || 0) + 1);
            }
            count++;
            amountInTill.set(denomination, count);
        }
    
        return changeBreakdown;
    }
    

    static processTransactions(amountInTill: Map<number, number>, transactions: number[], paidWith: number[][]): void {
        try {
            const writer: fs.WriteStream = fs.createWriteStream('output.txt', { flags: 'a' });

            writer.write("Till Start, Transaction Total, Paid, Change Total, Change Breakdown\n");

            let totalAmountInTill: number = TillManagement.calculateTotalAmountInTill(amountInTill);
            writer.write(`R${totalAmountInTill}, `);

            transactions.forEach((transactionAmount, i) => {
                totalAmountInTill += transactionAmount;

                const paidWithCustomer: number[] = paidWith[i];

                let totalPaid: number = 0;
                paidWithCustomer.forEach(denomination => {
                    totalPaid += denomination;
                });

                const changeTotal: number = totalPaid - transactionAmount;

                const changeBreakdown: Map<number, number> = TillManagement.updateTill(amountInTill, paidWithCustomer, transactionAmount);

                writer.write(`R${transactionAmount}, R${totalPaid}, R${changeTotal}, R`);
                changeBreakdown.forEach((count, denomination) => {
                    for (let j = 0; j < count; j++) {
                        writer.write(`${denomination}`);
                        if (j < count - 1) {
                            writer.write("-");
                        }
                    }
                    if (denomination < Math.max(...Array.from(changeBreakdown.keys()))) {
                        writer.write("-");
                    }
                });

                if (i < transactions.length - 1) {
                    writer.write("\nR" + totalAmountInTill + ", ");
                }
            });

            writer.write(`\nR${totalAmountInTill}\n`);
            writer.end();
        } catch (err) {
            console.error(err);
        }
    }
}

TillManagement.main();
