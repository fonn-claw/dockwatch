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
    marginBottom: 24,
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
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  statLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
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
  redText: {
    color: "#dc2626",
  },
  greenText: {
    color: "#16a34a",
  },
  yellowText: {
    color: "#ca8a04",
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
});

const PERIOD_LABELS: Record<string, string> = {
  month: "Current Month",
  quarter: "Current Quarter",
  year: "Trailing 12 Months",
};

interface ComplianceReportProps {
  data: {
    stats: {
      totalDue: number;
      completedOnTime: number;
      overdue: number;
      compliancePercent: number | null;
    };
    overdueItems: { name: string; assetName: string | null; daysOverdue: number }[];
    completionByCategory: {
      category: string;
      total: number;
      onTime: number;
      percent: number;
    }[];
    safetyCriticalItems: {
      name: string;
      assetName: string | null;
      status: string;
      compliancePercent: number | null;
    }[];
    recentAudit: {
      action: string;
      entityType: string;
      entityId: number | null;
      userName: string;
      createdAt: Date;
    }[];
    period: string;
    generatedAt: Date;
  };
}

function formatDate(date: Date | string): string {
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

export function ComplianceReportDocument({ data }: ComplianceReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Compliance Report</Text>
        <Text style={styles.subtitle}>
          Sunset Harbor Marina -- {PERIOD_LABELS[data.period] ?? data.period} --
          Generated {formatDate(data.generatedAt)}
        </Text>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Required</Text>
            <Text style={styles.statValue}>{data.stats.totalDue}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed On Time</Text>
            <Text style={styles.statValue}>{data.stats.completedOnTime}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Overdue</Text>
            <Text style={[styles.statValue, styles.redText]}>
              {data.stats.overdue}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Compliance %</Text>
            <Text
              style={[
                styles.statValue,
                data.stats.compliancePercent !== null &&
                data.stats.compliancePercent >= 90
                  ? styles.greenText
                  : data.stats.compliancePercent !== null &&
                    data.stats.compliancePercent >= 70
                  ? styles.yellowText
                  : styles.redText,
              ]}
            >
              {data.stats.compliancePercent !== null
                ? `${data.stats.compliancePercent}%`
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Overdue Items */}
        {data.overdueItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Overdue Items</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: "45%" }]}>
                  Schedule
                </Text>
                <Text style={[styles.headerCell, { width: "35%" }]}>Asset</Text>
                <Text
                  style={[
                    styles.headerCell,
                    { width: "20%", textAlign: "right" },
                  ]}
                >
                  Days Overdue
                </Text>
              </View>
              {data.overdueItems.map((item, i) => (
                <View
                  key={i}
                  style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={[styles.cell, { width: "45%" }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cell, { width: "35%" }]}>
                    {item.assetName ?? "N/A"}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.redText,
                      { width: "20%", textAlign: "right" },
                    ]}
                  >
                    {item.daysOverdue}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Completion by Category */}
        <Text style={styles.sectionTitle}>Completion by Category</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: "35%" }]}>Category</Text>
            <Text
              style={[
                styles.headerCell,
                { width: "20%", textAlign: "right" },
              ]}
            >
              Total
            </Text>
            <Text
              style={[
                styles.headerCell,
                { width: "20%", textAlign: "right" },
              ]}
            >
              On Time
            </Text>
            <Text
              style={[
                styles.headerCell,
                { width: "25%", textAlign: "right" },
              ]}
            >
              Rate
            </Text>
          </View>
          {data.completionByCategory.map((cat, i) => (
            <View
              key={i}
              style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={[styles.cell, { width: "35%", textTransform: "capitalize" }]}>
                {cat.category}
              </Text>
              <Text
                style={[styles.cell, { width: "20%", textAlign: "right" }]}
              >
                {cat.total}
              </Text>
              <Text
                style={[styles.cell, { width: "20%", textAlign: "right" }]}
              >
                {cat.onTime}
              </Text>
              <Text
                style={[styles.cell, { width: "25%", textAlign: "right" }]}
              >
                {cat.percent}%
              </Text>
            </View>
          ))}
        </View>

        {/* Safety-Critical Items */}
        {data.safetyCriticalItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Safety-Critical Items</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { width: "35%" }]}>
                  Schedule
                </Text>
                <Text style={[styles.headerCell, { width: "25%" }]}>Asset</Text>
                <Text style={[styles.headerCell, { width: "20%" }]}>
                  Status
                </Text>
                <Text
                  style={[
                    styles.headerCell,
                    { width: "20%", textAlign: "right" },
                  ]}
                >
                  Compliance
                </Text>
              </View>
              {data.safetyCriticalItems.map((item, i) => (
                <View
                  key={i}
                  style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={[styles.cell, { width: "35%" }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cell, { width: "25%" }]}>
                    {item.assetName ?? "N/A"}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: "20%" },
                      item.status === "overdue"
                        ? styles.redText
                        : item.status === "due_soon"
                        ? styles.yellowText
                        : styles.greenText,
                    ]}
                  >
                    {item.status === "overdue"
                      ? "Overdue"
                      : item.status === "due_soon"
                      ? "Due Soon"
                      : "On Track"}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: "20%", textAlign: "right" },
                    ]}
                  >
                    {item.compliancePercent !== null
                      ? `${item.compliancePercent}%`
                      : "N/A"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.footer}>
          DockWatch Compliance Report -- Confidential
        </Text>
      </Page>

      {/* Page 2: Recent Audit Trail */}
      {data.recentAudit.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Recent Audit Trail</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { width: "25%" }]}>Date</Text>
              <Text style={[styles.headerCell, { width: "20%" }]}>User</Text>
              <Text style={[styles.headerCell, { width: "20%" }]}>Action</Text>
              <Text style={[styles.headerCell, { width: "20%" }]}>Entity</Text>
              <Text
                style={[
                  styles.headerCell,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                ID
              </Text>
            </View>
            {data.recentAudit.slice(0, 40).map((entry, i) => (
              <View
                key={i}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.cell, { width: "25%" }]}>
                  {formatDateTime(entry.createdAt)}
                </Text>
                <Text style={[styles.cell, { width: "20%" }]}>
                  {entry.userName}
                </Text>
                <Text style={[styles.cell, { width: "20%" }]}>
                  {entry.action}
                </Text>
                <Text style={[styles.cell, { width: "20%" }]}>
                  {entry.entityType}
                </Text>
                <Text
                  style={[
                    styles.cell,
                    { width: "15%", textAlign: "right" },
                  ]}
                >
                  {entry.entityId ?? "-"}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.footer}>
            DockWatch Compliance Report -- Confidential
          </Text>
        </Page>
      )}
    </Document>
  );
}
