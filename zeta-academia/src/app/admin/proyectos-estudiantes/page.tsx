"use client";

import React, { useEffect, useState } from "react";
import CrudMenu from "@/components/crud-menu/CrudMenu";
import useFetchData from "@/app/hooks/useFetchData";
import { db } from "@/firebase/firebase";
import Head from "next/head";

// Define a type for the user data
type User = {
  id: string;
  displayName?: string;
  email: string;
  role: string;
};

// Define a type for the course data
type Course = {
  id: string;
  title: string;
};

// Define a type for the data returned by useFetchData
type CourseData = {
  id: string;
  title: string;
};

const StudentProjectsPage: React.FC = () => {
    //title//
  document.title = "Proyectos Estudiantes";
  const { data: adminUsersData } = useFetchData("users");
  const { data: courses } = useFetchData("onlineCourses");
  const collectionName = "studentProjects";

  const adminUsers = adminUsersData
    ? adminUsersData
        .filter((user: User) => user.role === "admin")
        .map((user: User) => ({
          value: user.id,
          label: user.displayName || user.email,
        }))
    : [];

  const displayFields = [
    { label: "Project Name", field: "projectName" },
    { label: "Student Email", field: "studentEmail" },
    { label: "Grade", field: "grade" },
    { label: "Status", field: "status" },
  ];

  const editFields = [
    { label: "Project Name", field: "projectName", type: "text" },
    { label: "Description", field: "description", type: "textarea" },
    { label: "File", field: "fileUrl", type: "file" },
    { label: "Student Email", field: "studentEmail", type: "email" },
    {
      label: "Course",
      field: "course",
      type: "select",
      selectType: "combobox",
      options: courses
        ? courses.map((course: CourseData) => ({
            value: course.id,
            label: course.title,
          }))
        : [],
    },
    { label: "Delivery Date", field: "deliveryDate", type: "date" },
    { label: "Review Date", field: "reviewDate", type: "date" },
    {
      label: "Reviewed By",
      field: "reviewedBy",
      type: "select",
      selectType: "combobox",
      options: adminUsers,
    },
    { label: "Grade", field: "grade", type: "number" },
    {
      label: "Status",
      field: "status",
      type: "select",
      selectType: "combobox",
      options: [
        { value: "not reviewed", label: "Not Reviewed" },
        { value: "reviewing", label: "Reviewing" },
        { value: "reviewed", label: "Reviewed" },
      ],
    },
  ];

  return (
    <div>
      <CrudMenu
        collectionName={collectionName}
        displayFields={displayFields}
        editFields={editFields}
        pageTitle="Proyectos de Estudiantes"
      />
    </div>
  );
};

export default StudentProjectsPage;
