import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../shared/functions/Context";

const AuditTrailPage = () => {
    const { projectId } = useParams();  
    const { api } = useAppContext();
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (!projectId) return;

        const fetchLogs = async () => {
            try {
                const fetchedLogs = await api.projectManagement.getProjectLogs(projectId); // Just pull the logs once
                setLogs(fetchedLogs); // Set the fetched logs in state
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        fetchLogs(); // Fetch logs on component mount

    }, [projectId]);

    return (
        <div>
            <h1>Audit Trail for Project {projectId}</h1>
            {logs.length === 0 ? (
                <p>No logs found for this project.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                        <th>User</th>
                           
                            <th>Timestamp</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                 <td>{log.displayName}</td>
                                <td>{log.time ? new Date(log.time).toLocaleString() : "No Timestamp"}</td>
                                <td>{log.actions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AuditTrailPage;
