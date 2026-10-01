import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
} from "@material-tailwind/react";

/* ================== SEMESTER DATA ================== */
const semesterData = [
  {
    semester: "Semester 4",
    subjects: [
      { code: "-", name: "MFDS", credits: 4 },
      { code: "-", name: "BES", credits: 4 },
      { code: "-", name: "TOC", credits: 4 },
      { code: "-", name: "WP", credits: 4 },
      { code: "-", name: "EEA", credits: 4 },
      { code: "-", name: "PAI", credits: 4 },
    ],
    practicals: [
      { name: "WP Lab",
        // grade: "A" 
      },
      { name: "BES Lab",
        // grade: "A-"
       },
      { name: "P A I Lab",
      // grade: "B" 
      },
    ],
  },
];

/* ================== TIMETABLE DATA ================== */
const timetable = [
  {
    day: "Monday",
    slots: ["PAI/WP/BES Lab", "PAI/WP/BES Lab", "PAI/WP/BES Lab", "LUNCH", "MFDS", "EEA", "SPORTS"],
  },
  {
    day: "Tuesday",
    slots: ["BES", "PAI", "TOC", "LUNCH", "EEA", "WP", "Library"],
  },
  {
    day: "Wednesday",
    slots: ["MFDS", "WP", "TOC", "LUNCH", "PAI Lab/WP/BES", "PAI Lab/WP/BES", "PAI Lab/WP/BES"],
  },
  {
    day: "Thursday",
    slots: ["EEA", "PAI", "WP", "LUNCH", "TOC", "MFDS", "Mentoring"],
  },
  {
    day: "Friday",
    slots: ["PAI/WP/BES Lab", "PAI/WP/BES Lab", "PAI/WP/BES Lab", "LUNCH", "PAI", "MFDS", "BES"],
  },
  {
    day: "Saturday",
    slots: ["-", "-", "-", "-", "-", "-", "-"],
  },
];

/* ================== MAIN COMPONENT ================== */
export default function SemesterAndTimeTable() {
  const headers = [
    "Day / Time",
    "9:10–10:10",
    "10:10–11:10",
    "11:15–12:15",
    "12:15–1:00",
    "1:00–2:00",
    "2:00–3:00",
    "3:05–4:05",
  ];

  return (
    <div className="mt-12 mb-8 flex flex-col gap-14">

      {/* ================== SEMESTER TABLE ================== */}
      {semesterData.map((semester, semKey) => (
        <Card key={semKey}>
          <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
            <Typography variant="h6" color="white">
              {semester.semester} - Subjects
            </Typography>
          </CardHeader>

          <CardBody className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  {["Code", "Name", "Credits", "Total", "Grade"].map((el) => (
                    <th key={el} className="border px-4 py-2 text-left">
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semester.subjects.map((subject, key) => {
                  const total =
                    (subject.ct1 || 0) +
                    (subject.ct2 || 0) +
                    (subject.theory || 0);

                  return (
                    <tr key={key}>
                      <td className="border px-4 py-2">{subject.code}</td>
                      <td className="border px-4 py-2">{subject.name}</td>
                      <td className="border px-4 py-2">{subject.credits}</td>
                      <td className="border px-4 py-2">
                        {total || "-"}
                      </td>
                      <td className="border px-4 py-2">
                        <Chip
                          value={subject.grade || "N/A"}
                          color={
                            total >= 90
                              ? "green"
                              : total >= 75
                              ? "blue"
                              : "red"
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>

          {/* PRACTICALS */}
          <CardHeader variant="gradient" color="gray" className="mb-6 p-6">
            <Typography variant="h6" color="white">
              {semester.semester} - Practicals
            </Typography>
          </CardHeader>

          <CardBody className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  {["Name", "Total", "Grade"].map((el) => (
                    <th key={el} className="border px-4 py-2 text-left">
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semester.practicals.map((p, key) => {
                  const total = (p.written || 0) + (p.viva || 0);

                  return (
                    <tr key={key}>
                      <td className="border px-4 py-2">{p.name}</td>
                      <td className="border px-4 py-2">
                        {total || "-"}
                      </td>
                      <td className="border px-4 py-2">
                        <Chip value={p.grade || "N/A"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ))}

      {/* ================== TIMETABLE ================== */}
      <Card>
        <CardHeader className="bg-blue-600 text-white p-4">
          <Typography variant="h6">
            IV Semester Time Table
          </Typography>
        </CardHeader>

        <CardBody className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="border px-4 py-2 text-sm">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {timetable.map((row, i) => (
                <tr key={i}>
                  <td className="border px-4 py-2 font-bold">
                    {row.day}
                  </td>

                  {row.slots.map((slot, j) => (
                    <td
                      key={j}
                      className={`border px-4 py-2 text-center ${
                        slot === "LUNCH"
                          ? "bg-yellow-200 font-bold"
                          : ""
                      }`}
                    >
                      {slot}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}