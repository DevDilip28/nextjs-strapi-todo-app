"use client";

import axiosInstance from "@/lib/axiox";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();

  const [todos, setTodos] = useState([]);

  const [title, setTitle] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editingText, setEditingText] = useState("");

  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  useEffect(() => {
    if (!token) {
      router.push("/signin");
      return;
    }

    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axiosInstance.get(
        `/todos?filters[user][id][$eq]=${user.id}&populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTodos(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!title.trim()) return;

    try {
      const response = await axiosInstance.post(
        "/todos",
        {
          data: {
            title,
            isCompleted: false,
            user: user.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTodos([...todos, response.data.data]);

      setTitle("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await axiosInstance.delete(`/todos/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTodos(todos.filter((todo) => todo.documentId !== documentId));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleStatus = async (todo) => {
    try {
      const response = await axiosInstance.put(
        `/todos/${todo.documentId}`,
        {
          data: {
            isCompleted: !todo.isCompleted,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTodos(todos.map((t) => (t.id === todo.id ? response.data.data : t)));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (todo) => {
    try {
      const response = await axiosInstance.put(
        `/todos/${todo.documentId}`,
        {
          data: {
            title: editingText,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTodos(todos.map((t) => (t.id === todo.id ? response.data.data : t)));

      setEditingId(null);

      setEditingText("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Todo Dashboard</h1>

            <p className="text-gray-500 mt-2">Welcome, {user.username}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Add new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAddTodo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
          >
            Add
          </button>
        </div>

        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border text-center text-gray-500">
              No todos yet
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white border rounded-xl p-5 flex items-center justify-between"
              >
                <div className="flex-1">
                  {editingId === todo.id ? (
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="border px-3 py-2 rounded-lg w-full"
                    />
                  ) : (
                    <>
                      <h3
                        className={`font-medium ${todo.isCompleted
                            ? "line-through text-gray-400"
                            : "text-gray-900"
                          }`}
                      >
                        {todo.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {todo.isCompleted ? "Completed" : "Pending"}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3 ml-4">
                  <button
                    onClick={() => toggleStatus(todo)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Toggle
                  </button>

                  {editingId === todo.id ? (
                    <button
                      onClick={() => handleEdit(todo)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditingText(todo.title);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(todo.documentId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
