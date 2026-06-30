import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as ExpoDocumentPicker from "expo-document-picker";
import { X, FileText, AlignLeft, Upload, Plus } from "lucide-react-native";
import { api } from "../lib/api";
import type { DocumentItem } from "../types";

const C = {
  bg: "#09090b",
  card: "#0f0c14",
  border: "#3f3f46",
  fg: "#fafafa",
  muted: "#27272a",
  mutedFg: "#a1a1aa",
  primary: "#7c2bca",
  primaryLight: "#9c69ed",
  danger: "#ef4444",
};

type Tab = "pdf" | "paste";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called after a successful upload/paste — passes back the new document. */
  onDocumentAdded: (doc: DocumentItem) => void;
}

export function UploadModal({ visible, onClose, onDocumentAdded }: Props) {
  const [tab, setTab] = useState<Tab>("pdf");

  // PDF state
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Paste state
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [pasting, setPasting] = useState(false);

  const reset = () => {
    setPickedFile(null);
    setUploading(false);
    setPasteTitle("");
    setPasteContent("");
    setPasting(false);
    setTab("pdf");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── PDF flow ──────────────────────────────────────────────────────────────
  const handlePickPdf = async () => {
    try {
      const result = await ExpoDocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setPickedFile({ uri: asset.uri, name: asset.name, size: asset.size });
    } catch (err) {
      Alert.alert("Алдаа", "PDF файл сонгоход алдаа гарлаа.");
    }
  };

  const handleUploadPdf = async () => {
    if (!pickedFile) return;
    setUploading(true);
    try {
      const doc = await api.uploadPdf(pickedFile.uri, pickedFile.name);
      onDocumentAdded(doc);
      handleClose();
    } catch (err) {
      Alert.alert("Алдаа", (err as Error).message ?? "PDF оруулахад алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  };

  // ── Paste flow ────────────────────────────────────────────────────────────
  const handlePaste = async () => {
    if (!pasteTitle.trim() || !pasteContent.trim()) {
      Alert.alert("Анхааруулга", "Гарчиг болон агуулгыг бөглөнө үү.");
      return;
    }
    setPasting(true);
    try {
      const doc = await api.pasteText({
        title: pasteTitle.trim(),
        content: pasteContent.trim(),
      });
      onDocumentAdded(doc);
      handleClose();
    } catch (err) {
      Alert.alert("Алдаа", (err as Error).message ?? "Текст хадгалахад алдаа гарлаа.");
    } finally {
      setPasting(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Баримт нэмэх</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color={C.mutedFg} />
            </Pressable>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tab, tab === "pdf" && styles.tabActive]}
              onPress={() => setTab("pdf")}
            >
              <FileText size={15} color={tab === "pdf" ? C.primary : C.mutedFg} />
              <Text style={[styles.tabText, tab === "pdf" && styles.tabTextActive]}>
                PDF оруулах
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, tab === "paste" && styles.tabActive]}
              onPress={() => setTab("paste")}
            >
              <AlignLeft size={15} color={tab === "paste" ? C.primary : C.mutedFg} />
              <Text style={[styles.tabText, tab === "paste" && styles.tabTextActive]}>
                Текст наах
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── PDF Tab ── */}
            {tab === "pdf" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.hint}>
                  PDF файлыг сонгоод "Оруулах" товчийг дарна уу. Файл backend-д
                  илгээгдэж, ухаалгаар хэсэгчлэгдэн, векторжуулагдана.
                </Text>

                <Pressable style={styles.dropZone} onPress={handlePickPdf}>
                  <Upload size={28} color={C.primaryLight} />
                  <Text style={styles.dropZoneTitle}>
                    {pickedFile ? pickedFile.name : "PDF файл сонгох"}
                  </Text>
                  {pickedFile?.size && (
                    <Text style={styles.dropZoneSub}>{formatBytes(pickedFile.size)}</Text>
                  )}
                  {!pickedFile && (
                    <Text style={styles.dropZoneSub}>Дарж файл сонгоно уу</Text>
                  )}
                </Pressable>

                {pickedFile && (
                  <Pressable
                    style={[styles.primaryBtn, uploading && styles.btnDisabled]}
                    onPress={handleUploadPdf}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Upload size={16} color="#fff" />
                        <Text style={styles.primaryBtnText}>Оруулах</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            )}

            {/* ── Paste Tab ── */}
            {tab === "paste" && (
              <View style={{ gap: 14 }}>
                <Text style={styles.hint}>
                  Текстийг доор наана уу. Гарчиг нь баримтын нэр болно.
                </Text>

                <View>
                  <Text style={styles.label}>Гарчиг</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="жишээ: Компанийн дүрэм"
                    placeholderTextColor={C.mutedFg}
                    value={pasteTitle}
                    onChangeText={setPasteTitle}
                    returnKeyType="next"
                  />
                </View>

                <View>
                  <Text style={styles.label}>
                    Агуулга{" "}
                    <Text style={{ color: C.mutedFg }}>
                      ({pasteContent.length.toLocaleString()} тэмдэгт)
                    </Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Текстийг энд наана уу..."
                    placeholderTextColor={C.mutedFg}
                    value={pasteContent}
                    onChangeText={setPasteContent}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <Pressable
                  style={[
                    styles.primaryBtn,
                    (pasting || !pasteTitle.trim() || !pasteContent.trim()) &&
                      styles.btnDisabled,
                  ]}
                  onPress={handlePaste}
                  disabled={pasting || !pasteTitle.trim() || !pasteContent.trim()}
                >
                  {pasting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Plus size={16} color="#fff" />
                      <Text style={styles.primaryBtnText}>Хадгалах</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#0f0c14",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "75%",
    borderTopWidth: 1,
    borderColor: "#3f3f46",
  },
  handle: {
    alignSelf: "center",
    marginTop: 10,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3f3f46",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#3f3f46",
  },
  headerTitle: {
    color: "#fafafa",
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#27272a",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#3f3f46",
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    borderColor: "#7c2bca",
  },
  tabText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#9c69ed",
  },
  hint: {
    color: "#a1a1aa",
    fontSize: 13,
    lineHeight: 20,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: "#7c2bca",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(124,43,202,0.05)",
  },
  dropZoneTitle: {
    color: "#fafafa",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  dropZoneSub: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7c2bca",
    borderRadius: 14,
    paddingVertical: 15,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  label: {
    color: "#fafafa",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#09090b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fafafa",
    fontSize: 14,
  },
  textArea: {
    height: 180,
    paddingTop: 12,
  },
});
