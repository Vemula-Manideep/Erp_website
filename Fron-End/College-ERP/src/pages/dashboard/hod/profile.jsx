import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Tooltip,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { ProfileInfoCard } from "@/widgets/cards";

export function Profile() {
  const student = {
    studentId: "S123456",
    major: "Computer Science",
    year: 3,
    studRollNo: 12045,
    studName: "Chandan",
    studFatherName: "Vinod Jadhav",
    studLastName: "Jadhav",
    studPhoneNumber: 9876543210,
    studentDob: "1998-05-14",
    studCategory: "General",
    studCaste: "Hindu",
    studentAge: 26,
    imageUrl: "/img/student-profile.jpeg",
    user: {
      email: "chandan.jadhav@example.com",
    },
    semesters: [
      {
        id: 1,
        semester: "Semester 1",
        name: "Data Structures",
        credits: 3,
        grade: "A",
      },
      {
        id: 2,
        semester: "Semester 2",
        name: "Algorithms",
        credits: 3,
        grade: "A",
      },
    ],
  };

  return (
    <>
      {/* HERO SECTION */}
      <div className="relative mt-6 h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* MAIN CARD */}
      <Card className="mx-4 -mt-20 mb-8 border border-gray-200 bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl">
        <CardBody className="p-6">

          {/* TOP SECTION */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-10">

            {/* PROFILE INFO */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  src={student.imageUrl}
                  size="xl"
                  className="rounded-xl shadow-lg ring-4 ring-white"
                />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></span>
              </div>

              <div>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {student.studName} {student.studLastName}
                </Typography>
                <Typography className="text-gray-600">
                  {student.major} • Year {student.year}
                </Typography>
              </div>
            </div>

            {/* TABS */}
            <Tabs value="info" className="w-full md:w-96">
              <TabsHeader className="bg-gray-100 rounded-xl p-1">
                <Tab value="info" className="flex items-center gap-2">
                  <HomeIcon className="h-5 w-5" /> Info
                </Tab>
                <Tab value="semesters" className="flex items-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="h-5 w-5" /> Semesters
                </Tab>
                <Tab value="settings" className="flex items-center gap-2">
                  <Cog6ToothIcon className="h-5 w-5" /> Settings
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>

          {/* CONTENT */}
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">

            {/* PERSONAL INFO */}
            <div>
              <Typography variant="h6" className="mb-4 text-gray-800">
                Personal Information
              </Typography>

              <div className="hover:shadow-lg transition rounded-xl">
                <ProfileInfoCard
                  title="Student Details"
                  description="Personal & academic information"
                  details={{
                    "Full Name": `${student.studName} ${student.studLastName}`,
                    "Father's Name": student.studFatherName,
                    "Roll Number": student.studRollNo,
                    "Date of Birth": student.studentDob,
                    Age: student.studentAge,
                    "Phone Number": student.studPhoneNumber,
                    Email: student.user.email,
                    Category: student.studCategory,
                    Caste: student.studCaste,
                  }}
                  action={
                    <Tooltip content="Edit Profile">
                      <PencilIcon className="h-4 w-4 cursor-pointer text-blue-500 hover:scale-110 transition" />
                    </Tooltip>
                  }
                />
              </div>
            </div>

            {/* ACADEMIC INFO */}
            <div className="xl:col-span-2">
              <Typography variant="h6" className="mb-4 text-gray-800">
                Academic Information
              </Typography>

              <div className="grid md:grid-cols-2 gap-4">
                {student.semesters.map((semester) => (
                  <Card
                    key={semester.id}
                    className="p-4 border border-gray-200 shadow-md hover:shadow-xl transition rounded-xl"
                  >
                    <Typography className="font-semibold text-blue-600">
                      {semester.semester}
                    </Typography>

                    <Typography className="text-gray-700 mt-1">
                      {semester.name}
                    </Typography>

                    <div className="flex justify-between mt-3 text-sm text-gray-600">
                      <span>Credits: {semester.credits}</span>
                      <span className="font-semibold text-green-600">
                        {semester.grade}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;