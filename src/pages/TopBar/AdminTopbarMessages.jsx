import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Modal, Button, Switch, Input } from "antd";
import { FaPlus, FaTrash } from "react-icons/fa";
import {
  getTopbarMessages,
  createTopbarMessage,
  deleteTopbarMessage,
  toggleTopbarMessage,
} from "../../Interceptor/interceptor";

const AdminTopbarMessages = () => {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [highlightText, setHighlightText] = useState("");

  const fetchMessages = async () => {
    const res = await getTopbarMessages();
    setMessages(res.data || []);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCreate = async () => {
    await createTopbarMessage({ text, highlightText });
    setText("");
    setHighlightText("");
    setOpen(false);
    fetchMessages();
  };

  const handleToggle = async (row) => {
    await toggleTopbarMessage(row._id);
    fetchMessages();
  };

  const handleDelete = async (id) => {
    await deleteTopbarMessage(id);
    fetchMessages();
  };

  const columns = [
    {
      name: "S.No",
      cell: (_, index) => index + 1,
      width: "8%",
    },
    {
      name: "Highlight",
      selector: (row) => row.highlightText || "-",
      width: "20%",
    },
    {
      name: "Message",
      selector: (row) => row.text,
      grow: 2,
    },
    {
      name: "Active",
      cell: (row) => (
        <Switch checked={row.isActive} onChange={() => handleToggle(row)} />
      ),
      width: "10%",
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
        >
          <FaTrash size={14} />
        </button>
      ),
      width: "10%",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Topbar Messages</h2>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded"
          >
            <FaPlus /> Add Message
          </button>
        </div>

        <DataTable
          columns={columns}
          data={messages}
          pagination
          highlightOnHover
        />
      </div>

      {/* ADD MODAL */}
      <Modal
        title="Add Topbar Message"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            className="bg-emerald-600 text-white"
            onClick={handleCreate}
          >
            Save
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <Input
            placeholder="Highlight text (e.g. FREE SHIPPING)"
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
          />
          <Input.TextArea
            rows={3}
            placeholder="Message text (e.g. on orders above ₹499)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminTopbarMessages;
