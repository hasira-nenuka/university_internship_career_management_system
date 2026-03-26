import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { resolveUploadUrl } from "./uploadUrl";

const ALL_PROFILES_URL = "http://localhost:5000/api/profiles/all";

function S_PviewCompany() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "Not provided";
    }
    return items.join(", ");
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await axios.get(ALL_PROFILES_URL);
        setStudents(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch student profiles", err);
        setError(err.response?.data?.message || "Failed to load student profiles");
      }
    };

    loadProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-white text-4xl font-bold">
            Student Profiles
          </h1>
          <p className="text-white/80 mt-2">
            Explore and review student details
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* BACK BUTTON */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow hover:scale-105 transition"
          >
            Back
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && students.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-600">
            No student profiles found.
          </div>
        )}

        {/* STUDENT CARDS */}
        <div className="grid gap-8">

          {students.map((student) => (
            <div
              key={student._id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 p-8"
            >

              {/* TOP PROFILE */}
              <div className="text-center border-b pb-6 mb-6">
                <img
                  src={
                    student.profileImage
                      ? resolveUploadUrl(student.profileImage)
                      : "/placeholder-profile.png"
                  }
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-500 shadow-md"
                  alt="profile"
                />

                <h2 className="text-2xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>

                <p className="text-gray-500">{student.email}</p>

                {student.cv && (
                  <a
                    href={resolveUploadUrl(student.cv)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:scale-105 transition"
                  >
                    View CV
                  </a>
                )}
              </div>

              {/* DETAILS */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* BASIC */}
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h3 className="font-bold text-indigo-700 mb-2">Basic Info</h3>
                  <p><b>First Name:</b> {student.firstName || "Not provided"}</p>
                  <p><b>Last Name:</b> {student.lastName || "Not provided"}</p>
                  <p><b>Province:</b> {student.province || "Not provided"}</p>
                  <p><b>District:</b> {student.district || "Not provided"}</p>
                  <p><b>Contact:</b> {student.contactNumber || "Not provided"}</p>
                </div>

                {/* EDUCATION */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-bold text-purple-700 mb-2">Education</h3>
                  <p><b>School:</b> {student.school || "Not provided"}</p>
                  <p><b>A/L Stream:</b> {student.localStream || "Not provided"}</p>
                  <p><b>Level:</b> {student.eduLevel || "Not provided"}</p>
                  <p><b>University:</b> {student.university || "Not provided"}</p>
                  <p><b>Degree:</b> {student.degree || "Not provided"}</p>
                </div>

                {/* SKILLS */}
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h3 className="font-bold text-indigo-700 mb-2">Skills</h3>
                  <p><b>Frontend:</b> {formatList(student.frontendSkills)}</p>
                  <p><b>Backend:</b> {formatList(student.backendSkills)}</p>
                  <p><b>Database:</b> {formatList(student.databaseSkills)}</p>
                  <p><b>Preferred:</b> {student.preferredField || "Not provided"}</p>
                </div>

                {/* EXTRA */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-bold text-purple-700 mb-2">Extra</h3>
                  <p><b>Leadership:</b> {student.leadership || "Not provided"}</p>
                  <p><b>Awards:</b> {student.awards || "Not provided"}</p>
                  <p className="whitespace-pre-line break-words">
                    <b>Bio:</b> {student.bio || "Not provided"}
                  </p>
                </div>

              </div>

              {/* CARD BUTTON */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate("/student/dashboard")}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Back
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default S_PviewCompany;
