import React, { useState } from "react";
import { Modal, Input, Select, Button, Table, Tag, Pagination } from "antd";
import { toast } from "react-toastify";
import type { AlignType } from "rc-table/lib/interface";

interface Transaction {
  id: number;
  name: string;
  date: string;
  status: "Delivered" | "Pending" | "Cancel";
  price: number;
  quantity: number;
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    name: "Rafael Reardon",
    date: "15/10/2025",
    status: "Delivered",
    price: 80,
    quantity: 1,
  },
  {
    id: 2,
    name: "Thomas Hirsch",
    date: "15/10/2025",
    status: "Pending",
    price: 76,
    quantity: 2,
  },
  {
    id: 3,
    name: "Archer Desaillly",
    date: "15/10/2025",
    status: "Delivered",
    price: 86,
    quantity: 1,
  },
  {
    id: 4,
    name: "Michael Flannery",
    date: "15/10/2025",
    status: "Cancel",
    price: 82,
    quantity: 2,
  },
  {
    id: 5,
    name: "Jamie",
    date: "15/10/2025",
    status: "Delivered",
    price: 84,
    quantity: 2,
  },
  {
    id: 6,
    name: "John Doe",
    date: "15/10/2025",
    status: "Pending",
    price: 90,
    quantity: 1,
  },
  {
    id: 7,
    name: "Jane Smith",
    date: "15/10/2025",
    status: "Delivered",
    price: 95,
    quantity: 3,
  },
  {
    id: 8,
    name: "Alice Johnson",
    date: "15/10/2025",
    status: "Cancel",
    price: 88,
    quantity: 2,
  },
  {
    id: 9,
    name: "Bob Brown",
    date: "15/10/2025",
    status: "Delivered",
    price: 78,
    quantity: 1,
  },
  {
    id: 10,
    name: "Charlie Davis",
    date: "15/10/2025",
    status: "Pending",
    price: 85,
    quantity: 2,
  },
];

const { Option } = Select;

// Helper function to convert date format from DD/MM/YYYY to YYYY-MM-DD
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Helper function to convert date format from YYYY-MM-DD to DD/MM/YYYY
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const LatestTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const handleEditClick = (transaction: Transaction) => {
    setEditTransaction({ 
      ...transaction,
      // Convert the display format (DD/MM/YYYY) to input format (YYYY-MM-DD)
      date: formatDateForInput(transaction.date)
    });
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!editTransaction) return;
    
    const updatedTransaction = {
      ...editTransaction,
      // Convert back to display format (DD/MM/YYYY) when saving
      date: formatDateForDisplay(editTransaction.date)
    };
    toast.success('Transaction updates successfully')
    
    setTransactions(
      transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
    setIsModalVisible(false);
    setEditTransaction(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditTransaction(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "id",
      key: "id",
      render: (_: any, __: any, index: number) => indexOfFirstTransaction + index + 1,
      align: "center" as AlignType,
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Transaction["status"]) => {
        let color = "";
        if (status === "Delivered") color = "green";
        else if (status === "Pending") color = "gold";
        else color = "red";
        return (
          <Tag 
            color={color} 
            key={status}
            style={{
              minWidth: "100px",
              textAlign: "center",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as AlignType,
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: any, record: Transaction) => `$${record.price * record.quantity}`,
      align: "center" as AlignType,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Transaction) => (
        <Button
          type="primary"
          onClick={() => handleEditClick(record)}
          style={{ backgroundColor: "var(--color-table)", borderColor: "var(--color-table)", transition: "all 0.3s" }}
          className="hover:!bg-secondary hover:!border-secondary"
        >
          Edit
        </Button>
      ),
      align: "center" as AlignType,
    },
  ];

  return (
    <div className="mx-5">
      <div className="p-6 bg-white shadow-lg rounded-lg mx-auto">
        <h2 className="text-lg text-left font-bold mb-4">Latest Transactions</h2>
        <Table
          columns={columns}
          dataSource={currentTransactions}
          rowKey="id"
          pagination={false}
          bordered
        />

        <div className="mt-4 flex justify-center">
          <Pagination
            current={currentPage}
            total={transactions.length}
            pageSize={transactionsPerPage}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>

        <Modal
          title="Edit Transaction"
          visible={isModalVisible}
          onOk={handleSave}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleSave}
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            >
              Save
            </Button>,
          ]}
        >
          <div className="space-y-4">
            <div>
              <label>Name:</label>
              <Input
                value={editTransaction?.name ?? ""}
                onChange={(e) =>
                  setEditTransaction(editTransaction ? {
                    ...editTransaction,
                    name: e.target.value,
                  } : null)
                }
              />
            </div>
            <div>
              <label>Date:</label>
              <Input
                type="date"
                value={editTransaction?.date ?? ""}
                onChange={(e) =>
                  setEditTransaction(editTransaction ? {
                    ...editTransaction,
                    date: e.target.value,
                  } : null)
                }
              />
            </div>
            <div>
              <label>Status:</label>
              <Select
                value={editTransaction?.status}
                style={{ width: "100%" }}
                onChange={(value: Transaction["status"]) =>
                  setEditTransaction(editTransaction ? {
                    ...editTransaction,
                    status: value,
                  } : null)
                }
              >
                <Option value="Delivered">Delivered</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Cancel">Cancel</Option>
              </Select>
            </div>
            <div>
              <label>Price:</label>
              <Input
                type="number"
                value={editTransaction?.price ?? ""}
                onChange={(e) =>
                  setEditTransaction(editTransaction ? {
                    ...editTransaction,
                    price: Number(e.target.value),
                  } : null)
                }
              />
            </div>
            <div>
              <label>Quantity:</label>
              <Input
                type="number"
                value={editTransaction?.quantity ?? ""}
                onChange={(e) =>
                  setEditTransaction(editTransaction ? {
                    ...editTransaction,
                    quantity: Number(e.target.value),
                  } : null)
                }
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LatestTransactions;