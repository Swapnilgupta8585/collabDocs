/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, useMemo } from "react";
import * as Y from "yjs";
import Quill from "quill";
import { QuillBinding } from "y-quill";
import "quill/dist/quill.snow.css";
import { WebsocketProvider } from "y-websocket";
import QuillCursors from "quill-cursors";
import DoUsername from "do_username";
import randomColor from "randomcolor";
import { IndexeddbPersistence } from "y-indexeddb";
import useDocStore from "../store/docStore";
import docService from "../services/docService";
import { motion } from "framer-motion";

// Register the Quill cursors module (for showing multiple users' cursors)
Quill.register("modules/cursors", QuillCursors);

// Shared editor container styles
const editorContainer =
  "flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";
const headerClasses =
  "px-6 py-3 bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 flex items-center justify-between";
const mainClasses = "flex-1 overflow-auto p-6 bg-gray dark:bg-black-500";
const fieldVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

// debounce function is an higher order function
// returns a debounced version of any function you pass to it
// function passed to it will only called after a certail dealy has passed without calling it again
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    // clear previous timer if any
    clearTimeout(timer),
      timer = setTimeout(() => fn(...args), delay)
  };
}

export default function Editor({ token, permission }) {
  const { currentDocId } = useDocStore();
  const docId = currentDocId;
  const editorRef = useRef(null);
  const initializeRef = useRef(false);
  const providerRef = useRef(null);
  const colorRef = useRef(null);

  const [username, setUsername] = useState(() => DoUsername.generate(16));
  const [activeUsers, setActiveUsers] = useState([]);

  // Toolbar configuration: no toolbar for view-only
  const toolbarOptions = useMemo(() => {
    if (permission === "view") return [];
    return [
      [{ font: [] }, { size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ direction: "rtl" }, { align: [] }],
      [ "image", "video"],
    ];
  }, [permission]);


  // Initialize the Yjs editor + bindings
  useEffect(() => {
    // Prevent double-initialization
    if (!editorRef.current || initializeRef.current) return;
    initializeRef.current = true;
    const ydoc = new Y.Doc();
    const persistence = new IndexeddbPersistence(`quill-doc-${docId}`, ydoc);
    persistence.on("synced", () => {
      console.log("Loaded data from IndexedDB!");
    });

    // room name
    const roomName = `doc-${docId}`;  

    // Connect to websocket 
    const provider = new WebsocketProvider(
      "wss://demos.yjs.dev/ws",
      roomName,
      ydoc
    );
    providerRef.current = provider;
    if (permission !== "edit") provider.disconnect();

    const awareness = provider.awareness;
    const color = randomColor();
    colorRef.current = color;

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
        cursors: permission === "edit",
        history: { userOnly: true },
      },
      readOnly: permission !== "edit",
      table: false,
    });
    quill.enable(permission === "edit");

    const ytext = ydoc.getText("quill");
    persistence.whenSynced.then(async () => {
      const current = ydoc.getText("quill").toString();
      if (current.length === 0) {
        try {
          const fetchedDoc = await docService.getDocById(docId);
          ytext.insert(0, fetchedDoc.doc.content);
        } catch (err) {
        console.error("Failed to fetch doc content:", err)
        }
      }
    });

    // auto-save to DB on changes
    const saveContent = debounce(() => {
      const textContent = ytext.toString();
      docService.updateDoc(docId, token, textContent)
      console.log("updated doc")
    }, 1000)

    ydoc.on("update", saveContent)

    new QuillBinding(ytext, quill, awareness);

    if (permission === "edit") {
      awareness.setLocalStateField("user", {
        name: username,
        color,
      });
    } else {
      awareness.setLocalStateField("user", null); // Removes the user field (no presence)
    }

    // Update the list of users when awareness changes (e.g. someone joins/leaves)
    const updateUserList = () => {
      // Extract user info from all awareness states
      const users = [];
      awareness.getStates().forEach((state, clientId) => {
        if (state.user) {
          users.push({
            id: clientId,
            name: state.user.name,
            color: state.user.color,
            isTyping: !!state.cursor,
          });
        }
      });
      setActiveUsers(users);
    };
    updateUserList();

    // Listen for awareness state changes
    awareness.on("change", updateUserList);

    // When the window is about to unload, clear your own awareness state
    const clearLocal = () => {
      awareness.setLocalStateField("user", null);
    };
    window.addEventListener("beforeunload", clearLocal);

    // Blur selection if the window loses focus
    const blurHandler = () => quill.blur();
    window.addEventListener("blur", blurHandler);


    // Log document updates from the local user
    ytext.observe((event) => {
      console.log("doc changed locally", event);
    });

    // Log WebSocket connection status
    provider.on("status", (event) => {
      console.log("connection status:", event.status);
    });

    // Log when synced with other peers
    provider.on("sync", (isSynced) => {
      console.log("synced with peers:", isSynced);
    });


    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", clearLocal);
      window.removeEventListener("blur", blurHandler);
      provider.disconnect();
      ydoc.off("update", saveContent);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, permission]);



  // Update presence when username changes
  useEffect(() => {
    const awareness = providerRef.current?.awareness;
    if (permission === "edit" && awareness) {
      awareness.setLocalStateField("user", { name: username, color: colorRef.current });
    }
  }, [username, permission]);


  return (
    <div className={editorContainer}>
      <motion.header
        className={headerClasses}
        initial="hidden"
        animate="visible"
        variants={fieldVariants}
      >
        <h1 className="text-lg font-semibold text-blue-500">
          📝 Editor
        </h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded px-2 sm:px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your username"
        />
      </motion.header>
      <motion.aside
        className="bg-gray-50 dark:bg-gray-800 px-6 py-2 text-sm text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700"
        initial="hidden"
        animate="visible"
        variants={fieldVariants}
      >
        Active users:
        <ul className="flex gap-4 mt-1 flex-wrap">
          {activeUsers.map((u) => (
            <li key={u.id} style={{ color: u.color }}>
              ● {u.name} {u.isTyping ? "✍️" : ""}
            </li>
          ))}
        </ul>
      </motion.aside>
      
      <main className={mainClasses}>
        <div ref={editorRef} className="font-white max-w-6xl mx-auto" />
      </main>
    </div>
  );
}