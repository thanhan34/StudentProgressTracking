"use client";

import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { normalizeStudentStatus, type Student } from "@/data/students";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export function useStudents() {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      try {
        if (isFirebaseConfigured && db) {
          const snapshot = await getDocs(collection(db, "students"));
          if (!snapshot.empty) {
            setStudentList(snapshot.docs.map((item) => normalizeStudent(item.data())));
          } else {
            setStudentList([]);
          }
        } else {
          throw new Error("Firebase chưa được cấu hình.");
        }
      } catch (error) {
        console.error("Không thể tải danh sách học viên:", error);
        setStorageError("Không thể tải dữ liệu Firebase. Vui lòng kiểm tra kết nối và quyền truy cập rồi tải lại trang.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadStudents();
  }, []);

  async function saveStudent(student: Student) {
    const previous = studentList;
    const next = previous.some((item) => item.id === student.id)
      ? previous.map((item) => item.id === student.id ? student : item)
      : [student, ...previous];

    setStudentList(next);
    setStorageError("");
    try {
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, "students", student.id), student);
      } else {
        throw new Error("Firebase chưa được cấu hình.");
      }
    } catch (error) {
      console.error("Không thể lưu học viên:", error);
      setStudentList(previous);
      setStorageError("Lưu học viên thất bại. Vui lòng thử lại.");
      throw error;
    }
  }

  async function removeStudent(studentId: string) {
    const previous = studentList;
    const next = previous.filter((item) => item.id !== studentId);
    setStudentList(next);
    setStorageError("");
    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, "students", studentId));
      } else {
        throw new Error("Firebase chưa được cấu hình.");
      }
    } catch (error) {
      console.error("Không thể xóa học viên:", error);
      setStudentList(previous);
      setStorageError("Xóa học viên thất bại. Vui lòng thử lại.");
      throw error;
    }
  }

  return { studentList, isLoading, storageError, saveStudent, removeStudent };
}

type LegacyStudent = Omit<Student, "instructors" | "teachingAssistants"> & {
  instructors?: string[];
  teachingAssistants?: string[];
  instructor?: string;
  teachingAssistant?: string;
};

function normalizeStudent(value: unknown): Student {
  const student = value as LegacyStudent;
  const { instructor, teachingAssistant, ...currentStudent } = student;
  return {
    ...currentStudent,
    status: normalizeStudentStatus(student.status),
    instructors: normalizeNames(student.instructors, instructor),
    teachingAssistants: normalizeNames(student.teachingAssistants, teachingAssistant),
    color: normalizeBrandColor(student.color),
  };
}

function normalizeNames(names?: string[], legacyName?: string) {
  const values = Array.isArray(names) ? names : legacyName ? [legacyName] : [];
  return [...new Map(values.map((name) => name.trim()).filter(Boolean).map((name) => [name.toLocaleLowerCase("vi"), name])).values()];
}

function normalizeBrandColor(color?: string) {
  const intensiveColors = ["#fc5d01", "#fd7f33", "#ffac7b", "#fdbc94"];
  if (color && intensiveColors.includes(color.toLocaleLowerCase())) return color;
  return intensiveColors[Math.abs(hashString(color ?? "pte-intensive")) % intensiveColors.length];
}

function hashString(value: string) {
  return [...value].reduce((hash, character) => ((hash << 5) - hash) + character.charCodeAt(0), 0);
}