import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { resolveUploadUrl } from "./uploadUrl";

const API_BASE_URL = "http://localhost:5000/api/profiles";

function S_ProfileView() {
  const [student, setStudent] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "Not provided";
    }
    return items.join(", ");
  };

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("student"));
    const account = JSON.parse(localStorage.getItem("studentAccount")) || storedProfile;
    if (storedProfile) setStudent(storedProfile);

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/${id}`);
        setStudent(res.data);
        localStorage.setItem("student", JSON.stringify(res.data));
      } catch (err) {
        try {
          if (account?.email) {
            const profileRes = await axios.get(
              `${API_BASE_URL}/email/${encodeURIComponent(account.email)}`
            );
            setStudent(profileRes.data);
            localStorage.setItem("student", JSON.stringify(profileRes.data));
            return;
          }
        } catch (emailErr) {
          console.error("Failed to fetch profile by email", emailErr);
        }

        console.error("Failed to fetch profile", err);
        const data = JSON.parse(localStorage.getItem("student"));
        if (data) setStudent(data);
      }
    };

    if (id) fetchProfile();
    else {
      const data = JSON.parse(localStorage.getItem("student"));
      if (data) setStudent(data);
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${student._id}`);

      const account = JSON.parse(localStorage.getItem("studentAccount"));
      if (account) {
        localStorage.setItem("student", JSON.stringify(account));
      } else {
        localStorage.removeItem("student");
      }

      alert("Profile deleted");
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const sectionCard = "bg-white rounded-2xl shadow-lg p-6";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-48 flex items-center justify-center shadow-lg">
        <h1 className="text-white text-4xl font-bold tracking-wide">
          My Profile
        </h1>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 -mt-20">

        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">

          {/* Profile Image */}
          <div className="flex justify-center">
            <img
              src={
                student.profileImage
                  ? resolveUploadUrl(student.profileImage)
                  : "/placeholder-profile.png"
              }
              className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg object-cover"
              alt="profile"
            />
          </div>

          {/* Name */}
          <h2 className="text-3xl font-bold mt-4">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-gray-500">{student.email}</p>

          {/* CV BUTTON */}
          {student.cv && (
            <a
              href={resolveUploadUrl(student.cv)}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow hover:scale-105 transition"
            >
              View CV
            </a>
          )}

        </div>

        {/* DETAILS */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">

          {/* BASIC */}
          <div className={sectionCard}>
            <h3 className="text-lg font-bold mb-3 text-indigo-600">Basic Info</h3>
            <p><b>Province:</b> {student.province || "Not provided"}</p>
            <p><b>District:</b> {student.district || "Not provided"}</p>
            <p><b>Contact:</b> {student.contactNumber || "Not provided"}</p>
          </div>

          {/* SCHOOL */}
          <div className={sectionCard}>
            <h3 className="text-lg font-bold mb-3 text-purple-600">School</h3>
            <p><b>School:</b> {student.school || "Not provided"}</p>
            <p><b>A/L Stream:</b> {student.localStream || "Not provided"}</p>
          </div>

          {/* UNIVERSITY */}
          <div className={sectionCard}>
            <h3 className="text-lg font-bold mb-3 text-indigo-600">University</h3>
            <p><b>Level:</b> {student.eduLevel || "Not provided"}</p>
            <p><b>University:</b> {student.university || "Not provided"}</p>
            <p><b>Degree:</b> {student.degree || "Not provided"}</p>
          </div>

          {/* SKILLS */}
          <div className={sectionCard}>
            <h3 className="text-lg font-bold mb-3 text-purple-600">Skills</h3>
            <p><b>Frontend:</b> {formatList(student.frontendSkills)}</p>
            <p><b>Backend:</b> {formatList(student.backendSkills)}</p>
            <p><b>Database:</b> {formatList(student.databaseSkills)}</p>
            <p><b>Preferred:</b> {student.preferredField || "Not provided"}</p>
          </div>

          {/* EXTRA */}
          <div className={`${sectionCard} md:col-span-2`}>
            <h3 className="text-lg font-bold mb-3 text-indigo-600">Extra Details</h3>
            <p><b>Leadership:</b> {student.leadership || "Not provided"}</p>
            <p><b>Awards:</b> {student.awards || "Not provided"}</p>
            <p><b>Bio:</b> {student.bio || "Not provided"}</p>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mt-8 mb-10">
          <button
            onClick={() => navigate("/student/profile")}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow hover:scale-105 transition"
          >
            Update Profile
          </button>

          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:scale-105 transition"
          >
            Delete Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default S_ProfileView;
