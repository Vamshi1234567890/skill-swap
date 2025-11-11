import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../util/UserContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useUser(); 
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  // techStack is an array of strings, one for each project's selection dropdown
  const [techStack, setTechStack] = useState([]); 

  const [activeKey, setActiveKey] = useState("registration");

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/user/unregistered/getDetails");
        console.log("User Data: ", data.data);
        
        // Initialize Education array
        const edu = data?.data?.education || [];
        edu.forEach((ele) => {
          ele.id = uuidv4();
        });
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        
        // Initialize Projects array
        const proj = data?.data?.projects || [];
        proj.forEach((ele) => {
          ele.id = uuidv4();
        });
        
        // Initialize TechStack dropdown state for each project
        setTechStack(proj.map(() => "Select some Tech Stack"));
        
        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name || prevState.name,
          email: data?.data?.email || prevState.email,
          username: data?.data?.username || prevState.username,
          skillsProficientAt: data?.data?.skillsProficientAt || prevState.skillsProficientAt,
          skillsToLearn: data?.data?.skillsToLearn || prevState.skillsToLearn,
          linkedinLink: data?.data?.linkedinLink || prevState.linkedinLink,
          githubLink: data?.data?.githubLink || prevState.githubLink,
          portfolioLink: data?.data?.portfolioLink || prevState.portfolioLink,
          education: edu,
          bio: data?.data?.bio || prevState.bio,
          projects: proj, // Use the fetched or initialized projects
        }));

      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          navigate("/login"); 
        } else {
          toast.error("Some error occurred during initialization");
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [navigate]); 

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked ? [...prevState[name], value] : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    const skillToAdd = name === "skill_to_learn" ? skillsToLearn : skillsProficientAt;

    if (skillToAdd === "Select some skill") {
      toast.error("Select a skill to add");
      return;
    }
    if (form.skillsToLearn.includes(skillToAdd) || form.skillsProficientAt.includes(skillToAdd)) {
      toast.error("Skill already added in one of the lists");
      return;
    }
    
    setForm((prevState) => ({
      ...prevState,
      [name === "skill_to_learn" ? "skillsToLearn" : "skillsProficientAt"]: [
        ...prevState[name === "skill_to_learn" ? "skillsToLearn" : "skillsProficientAt"],
        skillToAdd
      ]
    }));
  };

  const handleRemoveSkill = (e, listType) => {
    const skill = e.target.innerText.split(" ")[0];
    setForm((prevState) => ({
      ...prevState,
      [listType === "skills_proficient_at" ? "skillsProficientAt" : "skillsToLearn"]: 
        prevState[listType === "skills_proficient_at" ? "skillsProficientAt" : "skillsToLearn"].filter((item) => item !== skill),
    }));
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter((item) => item.id !== tid);
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation.length > 0 ? updatedEducation : [{ id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" }],
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  // 💡 NEW HANDLERS FOR PROJECT TECH STACK 
  const handleAddTechStack = (index) => {
    const selectedTechStack = techStack[index];

    if (selectedTechStack === "Select some Tech Stack") {
      toast.error("Select a tech stack to add");
      return;
    }

    const currentProject = form.projects[index];

    if (currentProject.techStack.includes(selectedTechStack)) {
      toast.error("Tech stack already added to this project");
      return;
    }

    setForm(prevState => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (
        i === index ? { ...item, techStack: [...item.techStack, selectedTechStack] } : item
      ))
    }));
  };

  const handleRemoveTechStack = (projectIndex, skillToRemove) => {
    setForm(prevState => ({
      ...prevState,
      projects: prevState.projects.map((project, i) => (
        i === projectIndex 
          ? { 
            ...project, 
            techStack: project.techStack.filter(skill => skill !== skillToRemove) 
            } 
          : project
      ))
    }));
  };
  // ---------------------------------------

  const validateRegForm = () => {
    if (!form.name || !form.email || !form.username) {
      toast.error("Name, Email, or Username is missing. Ensure all are filled.");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter at least one Skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter at least one Skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Enter at least one link among portfolio, github and linkedin");
      return false;
    }
    const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && githubRegex.test(form.githubLink) === false) {
      toast.error("Enter a valid github link");
      return false;
    }
    const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && linkedinRegex.test(form.linkedinLink) === false) {
      toast.error("Enter a valid linkedin link");
      return false;
    }
    if (form.portfolioLink && form.portfolioLink.includes("http") === false) {
      toast.error("Enter a valid portfolio link (must include http/https)");
      return false;
    }
    return true;
  };
  
  const validateEduForm = () => {
    let isValid = true;
    // Check if the education array is empty (it should contain at least one empty object if the user hasn't added anything)
    if (form.education.length === 0) {
      toast.error("Please add at least one education entry.");
      return false;
    }

    form.education.forEach((edu, index) => {
      // Only validate if the user started filling out the first field (institution)
      if (edu.institution || edu.degree || edu.startDate || edu.endDate || edu.score) {
        if (!edu.institution) {
          toast.error(`Institution name is empty in education field ${index + 1}`);
          isValid = false;
        }
        if (!edu.degree) {
          toast.error(`Degree is empty in education field ${index + 1}`);
          isValid = false;
        }
        if (!edu.startDate) {
          toast.error(`Start date is empty in education field ${index + 1}`);
          isValid = false;
        }
        if (!edu.endDate) {
          toast.error(`End date is empty in education field ${index + 1}`);
          isValid = false;
        }
        if (!edu.score) {
          toast.error(`Score is empty in education field ${index + 1}`);
          isValid = false;
        }
      }
    });
    return isValid;
  };
  
  const validateAddForm = () => {
    if (!form.bio) {
      toast.error("Bio is empty");
      return false;
    }
    if (form.bio.length > 500) {
      toast.error("Bio should be less than 500 characters");
      return false;
    }
    
    // Projects validation is now much more likely to pass because of the JSX/handler fix!
    var flag = true;
    form.projects.forEach((project, index) => {
      // Only validate if the user has started filling out the project title
      if (project.title) { 
        if (!project.title) {
          toast.error(`Title is empty in project ${index + 1}`);
          flag = false;
        }
        // 🚨 THIS WAS FAILING BEFORE THE HANDLER FIX 🚨
        if (!project.techStack || project.techStack.length === 0) { 
          toast.error(`Tech Stack is empty in project ${index + 1}`);
          flag = false;
        }
        if (!project.startDate) {
          toast.error(`Start Date is empty in project ${index + 1}`);
          flag = false;
        }
        if (!project.endDate) {
          toast.error(`End Date is empty in project ${index + 1}`);
          flag = false;
        }
        if (!project.projectLink) {
          toast.error(`Project Link is empty in project ${index + 1}`);
          flag = false;
        }
        if (!project.description) {
          toast.error(`Description is empty in project ${index + 1}`);
          flag = false;
        }
        if (new Date(project.startDate) > new Date(project.endDate)) {
          toast.error(`Start Date should be less than End Date in project ${index + 1}`);
          flag = false;
        }
        if (!project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
          toast.error(`Please provide valid project link (must include http/https) in project ${index + 1}`);
          flag = false;
        }
      }
    });
    return flag;
  };
  
  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    if (check) {
      setSaveLoading(true);
      try {
        await axios.post("http://localhost:8000/user/unregistered/saveRegDetails", form);
        toast.success("Registration details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };
  
  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        await axios.post("http://localhost:8000/user/unregistered/saveEduDetail", form);
        toast.success("Education details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };
  
  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    // validateAddForm is synchronous, no need for await
    const check3 = validateAddForm(); 
    
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        await axios.post("http://localhost:8000/user/unregistered/saveAddDetail", form);
        toast.success("Additional details saved successfully");
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Some error occurred");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  // 🚨 FINAL SUBMISSION TO COMPLETE REGISTRATION 🚨
  const handleFinalSubmit = async () => {
    // 1. Run all validations (removed await from synchronous calls)
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm(); 

    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
          // 💡 CRITICAL: Log data before sending to inspect
          console.log("Submitting final form data:", form); 
          
          const response = await axios.post("http://localhost:8000/user/registerUser", form); 

          // 2. Log the user in via context and redirect
          if (response.data.data) {
             login(response.data.data); 
          }
          
          toast.success("Registration Complete! Welcome to the platform.");
          navigate("/discover"); 
      } catch (error) {
          console.error("Final Registration failed:", error.response?.data || error);
          const errorMessage = error.response?.data?.message || "A network or unknown error occurred.";
          toast.error("Registration Failed: " + errorMessage);

          // Guide user to the tab that has the likely error
          if (errorMessage.toLowerCase().includes("username") || errorMessage.toLowerCase().includes("email")) {
            setActiveKey("registration"); 
          }

      } finally {
        setSaveLoading(false);
      }
    } else {
      // Guide user to the tab that failed validation
      if (!check1) setActiveKey("registration");
      else if (!check2) setActiveKey("education");
      else if (!check3) setActiveKey("longer-tab");
    }
  };
  

  return (
    <div className="register_page ">
      <h1 className="m-4" style={{ fontFamily: "Oswald", color: "#3BB4A1" }}>
        Registration Form
      </h1>
      {loading ? (
        <div className="row m-auto w-100 d-flex justify-content-center align-items-center" style={{ height: "80.8vh" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="register_section mb-3">
          <Tabs
            defaultActiveKey="registration"
            id="justify-tab-example"
            className="mb-3"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
          >
            <Tab eventKey="registration" title="Registration">
              {/* Name */}
              <div>
                <label style={{ color: "#3BB4A1" }}>Name</label>
                <br />
                <input
                  type="text"
                  name="name" 
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  value={form.name}
                  
                />
              </div>
              {/* Email */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Email
                </label>
                <br />
                <input
                  type="text"
                  name="email" 
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  value={form.email}
                  
                />
              </div>
              {/* Username */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Username
                </label>
                <br />
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  value={form.username}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your username"
                />
              </div>
              {/* Linkedin Profile Link*/}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Linkedin Link
                </label>
                <br />
                <input
                  type="text"
                  name="linkedinLink"
                  value={form.linkedinLink}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your Linkedin link"
                />
              </div>
              {/* Github Profile Link*/}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Github Link
                </label>
                <br />
                <input
                  type="text"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your Github link"
                />
              </div>
              {/* Portfolio Link */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Portfolio Link
                </label>
                <br />
                <input
                  type="text"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                  }}
                  placeholder="Enter your portfolio link"
                />
              </div>
              {/* Skills Proficient At */}
              <div>
                <label className="mt-3" style={{ color: "#3BB4A1" }}>
                  Skills Proficient At
                </label>
                <br />
                <Form.Select
                  aria-label="Default select example"
                  value={skillsProficientAt}
                  onChange={(e) => setSkillsProficientAt(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </Form.Select>
                {form.skillsProficientAt.length > 0 && (
                  <div>
                    {form.skillsProficientAt.map((skill, index) => (
                      <Badge
                        key={index}
                        bg="secondary"
                        className="ms-2 mt-2"
                        style={{ cursor: "pointer" }}
                        onClick={(event) => handleRemoveSkill(event, "skills_proficient_at")}
                      >
                        <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                      </Badge>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-3 ms-1" name="skill_proficient_at" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>
              {/* Skills to learn */}
              <div>
                <label style={{ color: "#3BB4A1", marginTop: "20px" }}>Skills To Learn</label>
                <br />
                <Form.Select
                  aria-label="Default select example"
                  value={skillsToLearn}
                  onChange={(e) => setSkillsToLearn(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </Form.Select>
                {form.skillsToLearn.length > 0 && (
                  <div>
                    {form.skillsToLearn.map((skill, index) => (
                      <Badge
                        key={index}
                        bg="secondary"
                        className="ms-2 mt-2 "
                        style={{ cursor: "pointer" }}
                        onClick={(event) => handleRemoveSkill(event, "skills_to_learn")}
                      >
                        <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                      </Badge>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary mt-3 ms-1" name="skill_to_learn" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveRegistration} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                </button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="education" title="Education">
              {form.education.map((edu, index) => (
                <div className="border border-dark rounded-1 p-3 m-1" key={edu.id}>
                  {/* Remove button for all but the first (or last) item */}
                  {form.education.length > 1 && (
                    <span className="w-100 d-flex justify-content-end">
                      <button className="btn btn-danger btn-sm" onClick={(e) => handleRemoveEducation(e, edu.id)}>
                        Remove
                      </button>
                    </span>
                  )}
                  <label style={{ color: "#3BB4A1" }}>Institution Name</label>
                  <br />
                  <input
                    type="text"
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your institution name"
                  />
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>
                    Degree
                  </label>
                  <br />
                  <input
                    type="text"
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your degree"
                  />
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>
                    Grade/Percentage
                  </label>
                  <br />
                  <input
                    type="number"
                    name="score"
                    value={edu.score}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your grade/percentage"
                  />
                  <div className="row w-100">
                    <div className="col-md-6">
                      <label className="mt-2" style={{ color: "#3BB4A1" }}>
                        Start Date
                      </label>
                      <br />
                      <input
                        type="date"
                        name="startDate"
                        value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={{
                          borderRadius: "5px",
                          border: "1px solid #3BB4A1",
                          padding: "5px",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="mt-2" style={{ color: "#3BB4A1" }}>
                        End Date
                      </label>
                      <br />
                      <input
                        type="date"
                        name="endDate"
                        value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        style={{
                          borderRadius: "5px",
                          border: "1px solid #3BB4A1",
                          padding: "5px",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                  <label className="mt-2" style={{ color: "#3BB4A1" }}>
                    Description
                  </label>
                  <br />
                  <input
                    type="text"
                    name="description"
                    value={edu.description}
                    onChange={(e) => handleEducationChange(e, index)}
                    style={{
                      borderRadius: "5px",
                      border: "1px solid #3BB4A1",
                      padding: "5px",
                      width: "100%",
                    }}
                    placeholder="Enter your exp or achievements"
                  />
                </div>
              ))}
              <div className="row my-2 d-flex justify-content-center">
                <button
                  className="btn btn-primary w-50"
                  onClick={() => {
                    setForm((prevState) => ({
                      ...prevState,
                      education: [
                        ...prevState.education,
                        {
                          id: uuidv4(),
                          institution: "",
                          degree: "",
                          startDate: "",
                          endDate: "",
                          score: "",
                          description: "",
                        },
                      ],
                    }));
                  }}
                >
                  Add Education
                </button>
              </div>
              <div className="row m-auto d-flex justify-content-center mt-3">
                <button className="btn btn-warning" onClick={handleSaveEducation} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                </button>
                <button onClick={handleNext} className="mt-2 btn btn-primary">
                  Next
                </button>
              </div>
            </Tab>
            <Tab eventKey="longer-tab" title="Additional">
              <div>
                <label style={{ color: "#3BB4A1", marginTop: "20px" }}>Bio (Max 500 Character)</label>
                <br />
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #3BB4A1",
                    padding: "5px",
                    width: "100%",
                    marginBottom: "10px",
                  }}
                  placeholder="Enter your bio"
                ></textarea>
              </div>
              <div className="">
                <label style={{ color: "#3BB4A1" }}>Projects</label></div>

                {form.projects.map((project, index) => (
                  <div className="border border-dark rounded-1 p-3 m-1" key={project.id}>
                    <span className="w-100 d-flex justify-content-end">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setForm((prevState) => ({
                            ...prevState,
                            projects: prevState.projects.filter((item) => item.id !== project.id),
                          }));
                        }}
                      >
                        Remove Project
                      </button>
                    </span>
                    <label style={{ color: "#3BB4A1" }}>Title</label>
                    <br />
                    <input
                      type="text"
                      name="title"
                      value={project.title}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={{
                        borderRadius: "5px",
                        border: "1px solid #3BB4A1",
                        padding: "5px",
                        width: "100%",
                      }}
                      placeholder="Enter your project title"
                    />
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>
                      Tech Stack
                    </label>
                    <br />
                    <Form.Select
                      aria-label="Default select example"
                      value={techStack[index] || "Select some Tech Stack"} 
                      onChange={(e) => {
                        setTechStack((prevState) => prevState.map((item, i) => (i === index ? e.target.value : item)));
                      }}
                    >
                      <option>Select some Tech Stack</option>
                      {skills.map((skill, i) => (
                        <option key={i} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </Form.Select>
                    
                    {/* Project Tech Stack Badges */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div>
                        {project.techStack.map((skill, i) => (
                          <Badge
                            key={i}
                            bg="success" 
                            className="ms-2 mt-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleRemoveTechStack(index, skill)}
                          >
                            <div className="span d-flex p-1 fs-7 ">{skill} &#10005;</div>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-secondary mt-3 ms-1" onClick={() => handleAddTechStack(index)}>
                      Add Tech Stack
                    </button>

                    <div className="row w-100">
                      <div className="col-md-6">
                        <label className="mt-2" style={{ color: "#3BB4A1" }}>
                          Start Date
                        </label>
                        <br />
                        <input
                          type="date"
                          name="startDate"
                          value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={{
                            borderRadius: "5px",
                            border: "1px solid #3BB4A1",
                            padding: "5px",
                            width: "100%",
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="mt-2" style={{ color: "#3BB4A1" }}>
                          End Date
                        </label>
                        <br />
                        <input
                          type="date"
                          name="endDate"
                          value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleAdditionalChange(e, index)}
                          style={{
                            borderRadius: "5px",
                            border: "1px solid #3BB4A1",
                            padding: "5px",
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>
                      Project Link
                    </label>
                    <br />
                    <input
                      type="text"
                      name="projectLink"
                      value={project.projectLink}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={{
                        borderRadius: "5px",
                        border: "1px solid #3BB4A1",
                        padding: "5px",
                        width: "100%",
                      }}
                      placeholder="Enter your project link"
                    />
                    <label className="mt-2" style={{ color: "#3BB4A1" }}>
                      Description
                    </label>
                    <br />
                    <textarea
                      name="description"
                      value={project.description}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      style={{
                        borderRadius: "5px",
                        border: "1px solid #3BB4A1",
                        padding: "5px",
                        width: "100%",
                        marginBottom: "10px",
                      }}
                      placeholder="Enter project description"
                    ></textarea>
                  </div>
                ))}
                <div className="row my-2 d-flex justify-content-center">
                  <button
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setForm((prevState) => ({
                        ...prevState,
                        projects: [
                          ...prevState.projects,
                          {
                            id: uuidv4(),
                            title: "",
                            techStack: [],
                            startDate: "",
                            endDate: "",
                            projectLink: "",
                            description: "",
                          },
                        ],
                      }));
                      setTechStack(prev => [...prev, "Select some Tech Stack"]);
                    }}
                  >
                    Add Project
                  </button>
                </div>
                
                <div className="row m-auto d-flex justify-content-center mt-3">
                  <button className="btn btn-warning" onClick={handleSaveAdditional} disabled={saveLoading}>
                    {saveLoading ? <Spinner animation="border" variant="primary" /> : "Save"}
                  </button>
                  <button onClick={handleNext} className="mt-2 btn btn-primary">
                    Next
                  </button>
                </div>
            </Tab>
            <Tab eventKey="Preview" title="Complete">
              {/* The Preview tab's content */}
              <div className="row m-auto d-flex justify-content-center mt-5">
                <h3 className="mb-4">Finalize Registration</h3>
                <p>Review your details on the previous tabs before completing your registration.</p>
                <button 
                  className="btn btn-success mt-2" 
                  onClick={handleFinalSubmit} 
                  disabled={saveLoading}
                >
                  {saveLoading ? <Spinner animation="border" size="sm" /> : "Complete Registration"}
                </button>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Register;