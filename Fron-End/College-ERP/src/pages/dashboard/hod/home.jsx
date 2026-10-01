import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export function Home() {
  return (
    <div className="mt-12 px-4">

      {/* STATS CARDS */}
      <div className="mb-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <div className="transform hover:scale-105 transition duration-300">
            <StatisticsCard
              key={title}
              {...rest}
              title={title}
              icon={React.createElement(icon, {
                className: "w-6 h-6 text-white",
              })}
              footer={
                <Typography className="font-normal text-blue-gray-600">
                  <strong className={footer.color}>{footer.value}</strong>
                  &nbsp;{footer.label}
                </Typography>
              }
            />
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <div className="shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition">
            <StatisticsChart
              key={props.title}
              {...props}
              footer={
                <Typography
                  variant="small"
                  className="flex items-center font-normal text-blue-gray-600"
                >
                  <ClockIcon className="h-4 w-4 text-blue-gray-400" />
                  &nbsp;{props.footer}
                </Typography>
              }
            />
          </div>
        ))}
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* SUBJECT TABLE */}
        <Card className="xl:col-span-2 backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl">
          <CardHeader
            floated={false}
            shadow={false}
            className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl"
          >
            <div>
              <Typography variant="h6" className="text-white">
                Subjects
              </Typography>
              <Typography className="flex items-center gap-1 text-white/80 text-sm">
                <CheckCircleIcon className="h-4 w-4" />
                30 chapters completed this month
              </Typography>
            </div>

            <Menu>
              <MenuHandler>
                <IconButton variant="text" className="text-white">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>

          <CardBody className="overflow-x-auto px-0">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["subject", "lecturer", "lecture's", "completion"].map(
                    (el) => (
                      <th
                        key={el}
                        className="py-3 px-6 text-left border-b text-gray-500 text-xs uppercase"
                      >
                        {el}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {projectsTableData.map(
                  ({ img, name, members, budget, completion }, key) => (
                    <tr
                      key={name}
                      className="hover:bg-blue-50 transition"
                    >
                      <td className="py-4 px-6 flex items-center gap-3">
                        <Avatar src={img} size="sm" />
                        <Typography className="font-semibold">
                          {name}
                        </Typography>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex">
                          {members.map(({ img, name }, i) => (
                            <Tooltip key={name} content={name}>
                              <Avatar
                                src={img}
                                size="xs"
                                className={`border-2 border-white ${
                                  i !== 0 && "-ml-2"
                                }`}
                              />
                            </Tooltip>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center text-sm">
                        {budget}
                      </td>

                      <td className="py-4 px-6">
                        <Typography className="text-xs mb-1">
                          {completion}%
                        </Typography>
                        <Progress
                          value={completion}
                          color={completion === 100 ? "green" : "blue"}
                          className="h-2 rounded-full"
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* OVERVIEW */}
        <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-green-400 to-teal-500 p-6 rounded-t-2xl">
            <Typography variant="h6" className="text-white">
              ID Card Overview
            </Typography>
            <Typography className="text-white/80 text-sm flex items-center gap-1">
              <ArrowUpIcon className="h-4 w-4" />
              24% increase this month
            </Typography>
          </CardHeader>

          <CardBody>
            {ordersOverviewData.map(
              ({ icon, color, title, description }, key) => (
                <div
                  key={title}
                  className="flex items-start gap-4 py-3 border-b last:border-none"
                >
                  <div className="p-2 rounded-full bg-blue-100">
                    {React.createElement(icon, {
                      className: `h-5 w-5 ${color}`,
                    })}
                  </div>

                  <div>
                    <Typography className="font-medium">
                      {title}
                    </Typography>
                    <Typography className="text-xs text-gray-500">
                      {description}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;