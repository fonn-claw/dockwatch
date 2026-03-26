import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    width: 80,
  },
  infoValue: {
    fontSize: 9,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#475569",
  },
  cell: {
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
  },
  emptyText: {
    fontSize: 10,
    color: "#94a3b8",
    fontStyle: "italic",
    marginBottom: 12,
  },
});

function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  created: "Created",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  verified: "Verified",
};

interface AssetHistoryProps {
  data: {
    asset: {
      id: number;
      name: string;
      assetType: string;
      location: string;
      dockName: string | null;
      installDate: Date | null;
      conditionRating: number;
    };
    workOrders: {
      id: number;
      title: string;
      status: string;
      type: string;
      dueDate: Date | null;
      completedAt: Date | null;
      timeSpentMinutes: number | null;
      assigneeName: string;
      partsCost: number;
    }[];
    auditLogs: {
      action: string;
      userName: string;
      createdAt: Date;
      metadata: Record<string, unknown> | null;
    }[];
    linkedSchedules: {
      name: string;
      frequency: string;
      nextDueAt: Date;
      isSafetyCritical: boolean;
      isActive: boolean;
    }[];
    generatedAt: Date;
  };
}

export function AssetHistoryDocument({ data }: AssetHistoryProps) {
  const conditionLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Maintenance History -- {data.asset.name}
        </Text>
        <Text style={styles.subtitle}>
          Generated {formatDate(data.generatedAt)}
        </Text>

        {/* Asset Info */}
        <View style={{ marginBottom: 16 }}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {data.asset.assetType.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{data.asset.location}</Text>
          </View>
          {data.asset.dockName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dock:</Text>
              <Text style={styles.infoValue}>{data.asset.dockName}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Install Date:</Text>
            <Text style={styles.infoValue}>
              {formatDate(data.asset.installDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Condition:</Text>
            <Text style={styles.infoValue}>
              {data.asset.conditionRating}/5 (
              {conditionLabels[data.asset.conditionRating] ?? "Unknown"})
            </Text>
          </View>
        </View>

        {/* Work Order History */}
        <Text style={styles.sectionTitle}>Work Order History</Text>
        {data.workOrders.length === 0 ? (
          <Text style={styles.emptyText}>No work orders recorded.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: "25%" }]}>Date</Text>
              <Text style={[styles.headerCell, { width: "30%" }]}>Title</Text>
              <Text style={[styles.headerCell, { width: "15%" }]}>Status</Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                Parts Cost
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                Time (min)
              </Text>
            </View>
            {data.workOrders.map((wo, i) => (
              <View
                key={wo.id}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.cell, { width: "25%" }]}>
                  {formatDate(wo.completedAt ?? wo.dueDate)}
                </Text>
                <Text style={[styles.cell, { width: "30%" }]}>{wo.title}</Text>
                <Text style={[styles.cell, { width: "15%" }]}>
                  {STATUS_LABELS[wo.status] ?? wo.status}
                </Text>
                <Text
                  style={[styles.cell, { width: "15%", textAlign: "right" }]}
                >
                  ${(wo.partsCost / 100).toFixed(2)}
                </Text>
                <Text
                  style={[styles.cell, { width: "15%", textAlign: "right" }]}
                >
                  {wo.timeSpentMinutes ?? "-"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Linked Schedules */}
        <Text style={styles.sectionTitle}>Linked Maintenance Schedules</Text>
        {data.linkedSchedules.length === 0 ? (
          <Text style={styles.emptyText}>No linked schedules.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: "35%" }]}>Name</Text>
              <Text style={[styles.headerCell, { width: "20%" }]}>
                Frequency
              </Text>
              <Text style={[styles.headerCell, { width: "20%" }]}>
                Next Due
              </Text>
              <Text style={[styles.headerCell, { width: "15%" }]}>Safety</Text>
              <Text style={[styles.headerCell, { width: "10%" }]}>Active</Text>
            </View>
            {data.linkedSchedules.map((sched, i) => (
              <View
                key={i}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.cell, { width: "35%" }]}>
                  {sched.name}
                </Text>
                <Text style={[styles.cell, { width: "20%", textTransform: "capitalize" }]}>
                  {sched.frequency}
                </Text>
                <Text style={[styles.cell, { width: "20%" }]}>
                  {formatDate(sched.nextDueAt)}
                </Text>
                <Text style={[styles.cell, { width: "15%" }]}>
                  {sched.isSafetyCritical ? "Yes" : "No"}
                </Text>
                <Text style={[styles.cell, { width: "10%" }]}>
                  {sched.isActive ? "Yes" : "No"}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          DockWatch Asset History -- Confidential
        </Text>
      </Page>

      {/* Page 2: Audit Trail */}
      {data.auditLogs.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Audit Trail</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: "30%" }]}>Date</Text>
              <Text style={[styles.headerCell, { width: "25%" }]}>User</Text>
              <Text style={[styles.headerCell, { width: "45%" }]}>Action</Text>
            </View>
            {data.auditLogs.map((entry, i) => (
              <View
                key={i}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.cell, { width: "30%" }]}>
                  {formatDateTime(entry.createdAt)}
                </Text>
                <Text style={[styles.cell, { width: "25%" }]}>
                  {entry.userName}
                </Text>
                <Text style={[styles.cell, { width: "45%" }]}>
                  {entry.action}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.footer}>
            DockWatch Asset History -- Confidential
          </Text>
        </Page>
      )}
    </Document>
  );
}
