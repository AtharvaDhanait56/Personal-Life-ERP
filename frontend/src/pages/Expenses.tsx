import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createExpense, fetchExpenses } from "../services/api";
import type { Expense } from "../types";

export function Expenses() {
  const queryClient = useQueryClient();

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth() + 1
  );

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
  );

  const [search, setSearch] = useState("");

  const {
    data: expenses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expenses", selectedMonth, selectedYear],
    queryFn: () =>
      fetchExpenses(selectedMonth, selectedYear),
  });

  const addExpense = useMutation({
    mutationFn: createExpense,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [
          "expenses",
          selectedMonth,
          selectedYear,
        ],
      }),
  });

  const [form, setForm] = useState({
    title: "",
    amount: "",
    spentOn: new Date().toISOString().slice(0, 10),
    paymentMethod: "UPI",
    notes: "",
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      expense.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [expenses, search]);

  const monthSpend = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const monthName = new Date(
    selectedYear,
    selectedMonth - 1
  ).toLocaleString("default", {
    month: "long",
  });

  const previousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const submit = () => {
    const amount = Number(form.amount);

    if (!form.title.trim() || amount <= 0) return;

    addExpense.mutate({
      ...form,
      title: form.title.trim(),
      amount,
      notes: form.notes.trim(),
    });

    setForm({
      title: "",
      amount: "",
      spentOn: new Date()
        .toISOString()
        .slice(0, 10),
      paymentMethod: "UPI",
      notes: "",
    });
  };

  const exportRows = (list: Expense[]) =>
    list.map((expense) => [
      expense.title,
      expense.amount.toFixed(2),
      new Date(expense.spentOn).toLocaleDateString(),
      expense.paymentMethod,
      expense.notes || "",
    ]);

  const exportHeader = ["Title", "Amount", "Date", "Payment Method", "Notes"];

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (filteredExpenses.length === 0) return;

    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const csv = [exportHeader, ...exportRows(filteredExpenses)]
      .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
      .join("\r\n");

    // UTF-8 BOM so Excel doesn't mangle the currency symbol / non-ASCII notes.
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    downloadBlob(blob, `expenses-${monthName}-${selectedYear}.csv`);
  };

  const exportPdf = () => {
    if (filteredExpenses.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Expenses - ${monthName} ${selectedYear}`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Total: Rs. ${monthSpend.toFixed(2)}`, 14, 23);

    autoTable(doc, {
      startY: 28,
      head: [exportHeader],
      body: exportRows(filteredExpenses),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [45, 212, 191] },
    });

    doc.save(`expenses-${monthName}-${selectedYear}.pdf`);
  };

  return (
    <div className="grid gap-4">

      <Card className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="text-sm text-muted">
            Monthly Spend
          </p>

          <p className="text-3xl font-bold">
            ₹ {monthSpend.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-muted">
            {filteredExpenses.length} Transactions
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            className="h-9 w-9 px-0"
            onClick={previousMonth}
          >
            <ChevronLeft size={18} />
          </Button>

          <h2 className="min-w-40 text-center text-lg font-semibold">
            {monthName} {selectedYear}
          </h2>

          <Button
            className="h-9 w-9 px-0"
            onClick={nextMonth}
          >
            <ChevronRight size={18} />
          </Button>

        </div>

        <div className="flex gap-2">

          <Button disabled={filteredExpenses.length === 0} onClick={exportPdf}>
            <Download size={16} />
            PDF
          </Button>

          <Button disabled={filteredExpenses.length === 0} onClick={exportExcel}>
            <FileSpreadsheet size={16} />
            Excel
          </Button>

        </div>

      </Card>

      <Card className="grid gap-3">

        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/6 px-3">

          <Search
            size={18}
            className="text-muted"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search expenses..."
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />

        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_130px_150px_150px_1.3fr_auto]">

          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
            placeholder="Expense title"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
            placeholder="Amount"
          />

          <input
            type="date"
            value={form.spentOn}
            onChange={(e) =>
              setForm({
                ...form,
                spentOn: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          />

          <select
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({
                ...form,
                paymentMethod: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-[#071012] px-3 text-sm outline-none"
          >
            <option>UPI</option>
            <option>Card</option>
            <option>Cash</option>
            <option>Bank</option>
          </select>

          <input
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
            placeholder="Notes"
          />

          <Button
            disabled={addExpense.isPending}
            onClick={submit}
          >
            Add
          </Button>

        </div>

      </Card>

      {isLoading && <Card>Loading expenses...</Card>}
      {isError && <Card>Unable to load expenses.</Card>}
      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">

        <Card>

          <h2 className="mb-4 text-lg font-semibold">
            Monthly Analytics
          </h2>

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={filteredExpenses}>

              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="title"
                stroke="#9bb0aa"
              />

              <Tooltip
                contentStyle={{
                  background: "#071012",
                  border:
                    "1px solid rgba(255,255,255,0.12)",
                }}
              />

              <Bar
                dataKey="amount"
                fill="#fbbf24"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </Card>

        <Card>

          <h2 className="mb-4 text-lg font-semibold">
            Transactions
          </h2>

          <div className="grid gap-3">

            {filteredExpenses.length === 0 && (
              <p className="text-sm text-muted">
                No expenses found.
              </p>
            )}

            {filteredExpenses.map((expense) => (

              <div
                key={expense.id}
                className="rounded-md bg-white/6 p-4"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-medium">
                      {expense.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      {expense.paymentMethod}
                    </p>

                    <p className="text-xs text-muted">
                      {new Date(
                        expense.spentOn
                      ).toLocaleDateString()}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xl font-bold text-amber">
                      ₹ {expense.amount}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </Card>

      </section>

    </div>
  );
}
