import React, { useEffect, useRef, useState } from "react";
import "./PrivateMessage.scss";
import { observer } from "mobx-react-lite";
import { collection, CollectionReference, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAppContext } from "../../../shared/functions/Context";
import { IPrivateMessage } from "../../../shared/models/three-sixty-feedback-models/messages/MessagesModel";
import { IChatModel, defaultChatModel } from "../../../shared/models/three-sixty-feedback-models/messages/ChatModel";
import { MessageLoader } from "./messageLoader/MessageLoader";
import { db } from "../../../shared/config/firebase-config";
import AttachClip from "./assets/attach-clip.png";
import sendIcon from "./assets/send.png";
import UserDisplay from "./UserDisplay/UserDisplay";
import UserDetails from "./UserDetails/user-details";
import UnreadMessagesEmailSender from "./UnreadMessagesEmailSender/UnreadMessagesEmailSender";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../shared/config/firebase-config";

export const PrivateMessage = observer(() => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson;
  const currentDate = Date.now();
  const [receiver, setReceiver] = useState<string>("");
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const [messageLoader, setMessageLoader] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserInitials, setSelectedUserInitials] = useState<string>("");
  const [dbCombinedId, setDbCombinedId] = useState<string>("");
  const [chatSession, setChatSession] = useState<IChatModel>({ ...defaultChatModel });
  const [chatSessions, setChatSessions] = useState<{ [key: string]: IPrivateMessage[] }>({});
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [filePreview,  setFilePreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
 

  const messagesRef = collection(db, 'PrivateMessages') as CollectionReference<IPrivateMessage>;

  // Assuming allUsers is retrieved and stored in store.user.all
  const allUsers = store.user.all;

  const employees = store.user.all
    .filter((u) => me?.role === "Admin" ? u.asJson.role === "Employee" : u.asJson.role === "Admin")
    .map((u) => ({
      value: u.asJson.uid,
      label: u.asJson.displayName + " " + u.asJson.lastName,
      jobTitle: u.asJson.jobTitle,
      role: u.asJson.role,
      displayName: u.asJson.displayName,
    }));

  // Define the function to generate combined ID for chat session
  const getCombinedId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("");
  };

  const handleSelectedUserClick = async (selectedUserId: string) => {
    setReceiver(selectedUserId);
    const combinedId = getCombinedId(me?.uid || "", selectedUserId);
    setDbCombinedId(combinedId);
  
    setChatSession({
      ...chatSession,
      users: [selectedUserId, me?.uid || ""],
    });
  
    const selectedUser = allUsers.find((user) => user.asJson.uid === selectedUserId);
    setSelectedUser(selectedUser);
  
    if (selectedUser && selectedUser.asJson.displayName) {
      const initials = calculateInitials(selectedUser.asJson.displayName);
      setSelectedUserInitials(initials);
    }
  
    await getData(combinedId);
  };
  

  const calculateInitials = (displayName: string): string => {
    const names = displayName.split(" ");
    const initials = names.map((name) => name.charAt(0)).join("").toUpperCase();
    return initials;
  };

  const getData = async (chatId: string) => {
    if (!chatId) return;
  
    setMessageLoader(true);
    const messagesRef = collection(db, `PrivateMessages/${chatId}/UserMessages`);
    const q = query(messagesRef, orderBy("dateAndTime", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedMessages = querySnapshot.docs.map((doc) => doc.data() as IPrivateMessage);
      setChatSessions((prevChatSessions) => ({
        ...prevChatSessions,
        [chatId]: updatedMessages,
      }));
      setMessageLoader(false);
    });
  
    return () => unsubscribe();
  };
  

  useEffect(() => {
    const fetchData = async () => {
      await api.user.getAll();
      if (dbCombinedId !== "") {
        await getData(dbCombinedId);
      }
    };
    fetchData();
  }, [api.user, dbCombinedId]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatSessions]);

  const selectedChatSession = chatSessions[dbCombinedId] || [];

  const [messageInput, setMessageInput] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; 
      if (selectedFile.size > maxSize) {
        setErrorMessage("File size should not exceed 10MB");
        setFileInput(null);
        setFilePreview(null);
        return;
      }
  
      setFileInput(selectedFile);
      setErrorMessage(null); // Clear any previous error message
  
      setUploadingFile(true); // Start file upload loader
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
  
      uploadFile(selectedFile)
        .then((fileURL) => {
          setFilePreview(fileURL); // Update file preview if needed
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        })
        .finally(() => {
          setUploadingFile(false); // Stop file upload loader
        });
    }
  };
  

  const handleFileDelete = () => {
    setFileInput(null);
    setFilePreview(null);
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `chatFiles/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };
  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (messageInput.trim() === "" && !fileInput) {
      return;
    }
  
    setSendingMessage(true); // Start sending loader
  
    let fileURL = "";
    let fileType = "";
    if (fileInput) {
      try {
        fileURL = await uploadFile(fileInput);
        fileType = fileInput.type;
      } catch (error) {
        console.error("Error uploading file:", error);
        setSendingMessage(false); // Stop sending loader on error
        return;
      }
    }
  
    const message: IPrivateMessage = {
      id: "",
      receiver: receiver,
      sender: me?.uid || "",
      message: messageInput,
      dateAndTime: currentDate || null,
      fileURL: fileURL,
      fileType: fileType,
      read: false,
    };
  
    if (dbCombinedId === "") {
      const combinedId = getCombinedId(me?.uid || "", receiver);
      try {
        await api.messages.create(message, combinedId, chatSession);
        setChatSessions((prevChatSessions) => ({
          ...prevChatSessions,
          [combinedId]: [message],
        }));
      } catch (error) {
        console.log(error);
      } finally {
        setMessageInput("");
        setFileInput(null);
        setFilePreview(null); // Clear file preview
        setSendingMessage(false); // Stop sending loader on completion
      }
    } else {
      try {
        await api.messages.createMessage(message, dbCombinedId);
      } catch (error) {
        console.log(error);
      } finally {
        setMessageInput("");
        setFileInput(null);
        setFilePreview(null); // Clear file preview
        setSendingMessage(false); // Stop sending loader on completion
      }
    }
  };
  
  return (
    <div className="uk-section leave-analytics-page private-message" style={{ textAlign: "center" }}>
      <div className="uk-container large uk-flex-column">
        <div className="uk-flex uk-flex-row">
          <div style={{ width: "40%" }}>
            <UserDisplay
              users={employees}
              handleSelectedUserClick={handleSelectedUserClick}
              receiver={receiver}
              allUsers={allUsers}
              chatSessions={chatSessions}
            />
          </div>
          <UserDetails selectedUser={selectedUser} selectedUserInitials={selectedUserInitials} />
          <div className="chat-container uk-align-center" style={{ flex: "1" }}>
            {messageLoader ? (
              <MessageLoader />
            ) : (
              <div className="chat-messages" id="chat-messages" ref={chatMessagesRef}>
                {Object.keys(chatSessions).length === 0 ? (
                  <div className="no-chats-message">No chats available</div>
                ) : selectedChatSession.length > 0 ? (
                  <div>
                    {selectedChatSession.map((message: IPrivateMessage, index: number) => {
                      const currentDate = new Date(message.dateAndTime || Date.now());
                      const formattedDate = currentDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });

                      const isFirstMessageOrDateChanged =
                        index === 0 ||
                        formattedDate !==
                          new Date(selectedChatSession[index - 1].dateAndTime || Date.now()).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          });

                      return (
                        <div key={index}>
                          <div
                            className={`message-container ${me?.uid === message.sender ? "right" : "left"}`}
                          >
                            {isFirstMessageOrDateChanged && <div className="message-date">{formattedDate}</div>}
                            <div
                              className="message"
                            >
                             <p className="message-text">
                               {message.message}
                               {message.fileURL && (
                                 <>
                                 {message.fileType?.startsWith("image/") && (
                                   <img
                                     src={message.fileURL}
                                     alt="Attachment"
                                     style={{ maxWidth: '200px', marginTop: '10px', cursor: 'pointer' }}
                                     onClick={() => window.open(message.fileURL, '_blank')}
                                   />
                                 )}

                                   {message.fileType === "application/pdf" && (
                                     <div>
                                       <a href={message.fileURL} download>
                                         Download PDF File 
                                       </a>
                                     </div>
                                   )}
                                   {message.fileType?.startsWith("video/") && (
                                     <video controls>
                                       <source src={message.fileURL} type={message.fileType} />
                                       Your browser does not support the video tag.
                                     </video>
                                   )}

                                  {(message.fileType === "application/vnd.ms-excel" ||
                                    message.fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && (
                                    <div>
                                      <a href={message.fileURL} download>
                                        Download Excel File
                                      </a>
                                    </div>
                                  )}
                                  {message.fileType === "text/plain" && (
                                    <div>
                                      <a href={message.fileURL} download>
                                        Download Text File
                                      </a>
                                    </div>
                                  )}
                                  {(message.fileType === "application/msword" ||
                                    message.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
                                    <div>
                                      <a href={message.fileURL} download>
                                        Download Word Document
                                      </a>
                                    </div>
                                  )}
                                  {(message.fileType === "application/vnd.ms-powerpoint" ||
                                    message.fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") && (
                                    <div>
                                      <a href={message.fileURL} download>
                                        Download PowerPoint Presentation
                                      </a>
                                    </div>
                                  )}
                                </>
                              )}
                            </p>
                            </div>
                            <div className="message-time">
                              <p>
                                {message.dateAndTime &&
                                  Date.now() - new Date(message.dateAndTime).getTime() >= 5000
                                  ? new Date(message.dateAndTime).toLocaleTimeString()
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-messages-message">No messages in this chat</div>
                )}
              </div>
            )}
           <form className="chat-input" onSubmit={sendMessage}>
               <input
                 className="uk-input uk-width-1-1"
                 type="text"
                 id="message-input"
                 placeholder="Write a message..."
                 value={messageInput}
                 onChange={(e) => setMessageInput(e.target.value)}
               />
               <div className="file-input-container">
                 <label htmlFor="file-input">
                   <img src={AttachClip} alt="Attach file" className="attachment-icon" />
                 </label>
                 <input
                   id="file-input"
                   type="file"
                   className="file-input"
                   onChange={handleFileChange}
                   style={{ display: "none" }}
                 />
               </div>             

               {filePreview && (
                 <div className="file-preview">
                   <img src={filePreview} alt="file preview" className="preview-image" />
                   <button type="button" onClick={handleFileDelete} className="delete-file-button">
                     &#x2715;
                   </button>
                 </div>
               )}             

               {errorMessage && <div className="error-message">{errorMessage}</div>}             

               <button className="uk-button primary" type="submit" disabled={sendingMessage}>
                 {sendingMessage ? <MessageLoader /> : <img src={sendIcon} alt="Send" style={{ marginRight: "5px" }} />}
               </button>
             </form>

            <UnreadMessagesEmailSender chatSessions={chatSessions} dbCombinedId={dbCombinedId} /> 
          </div>
        </div>
      </div>
    </div>
  );
});

export default PrivateMessage;

