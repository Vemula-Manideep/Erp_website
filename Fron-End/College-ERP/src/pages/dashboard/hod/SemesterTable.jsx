export function SemesterTable() {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12 px-4">

      {semesterData.map((semester, semKey) => (
        <Card key={semKey} className="shadow-xl border border-gray-200 rounded-2xl overflow-hidden">

          {/* SUBJECT HEADER */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-none">
            <Typography variant="h5" className="text-white font-semibold tracking-wide">
              {semester.semester} - Subjects
            </Typography>
          </CardHeader>

          {/* SUBJECT TABLE */}
          <CardBody className="overflow-x-auto px-0">
            <table className="w-full min-w-[700px] table-auto">
              <thead className="bg-gray-50">
                <tr>
                  {["Code", "Name", "Credits", "CT-1", "CT-2", "Theory", "Total", "Grade"].map((el) => (
                    <th
                      key={el}
                      className="py-3 px-6 text-left text-xs font-semibold uppercase text-gray-500"
                    >
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {semester.subjects.map((subject, key) => {
                  const total = subject.ct1 + subject.ct2 + subject.theory;

                  return (
                    <tr
                      key={subject.code}
                      className="hover:bg-blue-50 transition duration-200"
                    >
                      <td className="py-3 px-6 font-semibold text-gray-700">
                        {subject.code}
                      </td>

                      <td className="py-3 px-6 text-sm text-gray-600">
                        {subject.name}
                      </td>

                      <td className="py-3 px-6 text-sm font-medium">
                        {subject.credits}
                      </td>

                      <td className="py-3 px-6">{subject.ct1}</td>
                      <td className="py-3 px-6">{subject.ct2}</td>
                      <td className="py-3 px-6">{subject.theory}</td>

                      <td className="py-3 px-6 font-semibold text-blue-600">
                        {total}
                      </td>

                      <td className="py-3 px-6">
                        <Chip
                          variant="gradient"
                          color={
                            total >= 90
                              ? "green"
                              : total >= 75
                              ? "blue"
                              : "red"
                          }
                          value={subject.grade}
                          className="text-xs px-3 py-1 rounded-full"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>

           
           {/* PRACTICAL HEADER */}
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 rounded-none mt-4">
            <Typography variant="h5" className="text-white font-semibold tracking-wide">
              {semester.semester} - Practicals
            </Typography>
          </CardHeader>

          {/* PRACTICAL TABLE */}
          <CardBody className="overflow-x-auto px-0">
            <table className="w-full min-w-[600px] table-auto">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Written", "Viva", "Total", "Grade"].map((el) => (
                    <th
                      key={el}
                      className="py-3 px-6 text-left text-xs font-semibold uppercase text-gray-500"
                    >
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {semester.practicals.map((practical, key) => {
                  const total = practical.written + practical.viva;

                  return (
                    <tr
                      key={practical.name}
                      className="hover:bg-green-50 transition duration-200"
                    >
                      <td className="py-3 px-6 font-semibold text-gray-700">
                        {practical.name}
                      </td>

                      <td className="py-3 px-6">{practical.written}</td>
                      <td className="py-3 px-6">{practical.viva}</td>

                      <td className="py-3 px-6 font-semibold text-green-600">
                        {total}
                      </td>

                      <td className="py-3 px-6">
                        <Chip
                          variant="gradient"
                          color={
                            total >= 35
                              ? "green"
                              : total >= 25
                              ? "blue"
                              : "red"
                          }
                          value={practical.grade}
                          className="text-xs px-3 py-1 rounded-full"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>

        </Card>
      ))}

    </div>
  );
}