import React, { useEffect, useState } from "react";
import { useAppContext } from "../../shared/functions/Context";
import { hideModalFromId } from "../../shared/functions/ModalShow";
import MODAL_NAMES from "../dialogs/ModalName";
import "./AuditTrailPage.scss"; // Import styles

const AuditTrailModal = ({ projectId }) => {
    const { api } = useAppContext();
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (!projectId) return;

        const fetchLogs = async () => {
            try {
                const fetchedLogs = await api.projectManagement.getProjectLogs(projectId);
                setLogs(fetchedLogs);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        fetchLogs();
    }, [projectId]);
    
    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.PROJECTS.VIEW_TRAIL);
    };

    return (
        <div className="audit-trail-modal">
            <button
                className="uk-modal-close-default close-button"
                type="button"
                data-uk-close
            ></button>
            <h2 className="audit-trail-header">Audit Trail</h2>
            {logs.length === 0 ? (
                <p className="no-logs-message">No logs found for this project.</p>
            ) : (
                <div className="table-container">
                    <table className="audit-trail-table">
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
                </div>
            )}
        </div>
    );
};

export default AuditTrailModal;
