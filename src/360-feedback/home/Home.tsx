import { observer } from "mobx-react-lite";
import "./Home.scss";
import { ClassNames } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { Main360 } from "../Main360";

const Home = observer(() => {
  const navigate = useNavigate();
  const onNext = () => {
    navigate("/c/threesixty/home/dashboard");
  };
  return (
      <div className="background-container">
          {/* <a className="nextbutton" onClick={onNext}>
          Next &rarr;
        </a> */}
        <div className="home-container">
          <div className="container">
            
              <h4>What is 360-degree feedback?</h4>
            
      
            <div className="container-info">
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/360 View.png"}
                  alt="image"
                />
                <p>You get rated on your</p>
                <p> performance.</p>
              </div>
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/People.png"}
                  alt="image"
                />
                <p>People who know about </p>
                <p>your work give feedback, </p>
                <p>like colleagues and clients.</p>
              </div>
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/Thumbs Up Down.png"}
                  alt="image"
                />
                <p>Feedback comes from </p>
                <p>various sources like peers,</p>
                <p> managers, and clients. </p>
              </div>
            </div>
          </div>

          <div className="container2">
          <h4>Why does it matter?</h4>
            <div className="container-info">
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/Development Skill.png"}
                  alt="image"
                />
                <p>Encourages self </p>
                <p>awareness and </p>
                <p> development.</p>
              </div>
              <div className="column">
                <img
                  src={
                    process.env.PUBLIC_URL + "/icons/Performance Macbook.png"
                  }
                  alt="image"
                />
                <p>Increases understanding of </p>
                <p>required behaviors for personal </p>
                <p>and organizational effectiveness.</p>
              </div>
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/Reflection.png"}
                  alt="image"
                />
                <p>Helps individuals learn how peers perceive </p>
                <p> them, fostering self-awareness.</p>
              </div>
            </div>
          </div>

          <div className="container3">
          <h4>The assessment aims to gauge the level of ratings achieved through the 360 review exercise.</h4>
            <div className="container-info">
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/Permanent Job.png"}
                  alt="image"
                />
                <p className="mini-headings">SUBORDINATE</p>
                <p>provide feedback on </p>
                <p> leadership, coaching, </p>
                <p> support</p>
              </div>
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/Business group.png"}
                  alt="image"
                />
                <p className="mini-headings">COLLEAGUES</p>
                <p>assess ability to work as a</p>
                <p>team member</p>
              </div>
              <div className="column">
                <img
                  src={process.env.PUBLIC_URL + "/icons/Satisfaction.png"}
                  alt="image"
                />
                <p className="mini-headings">CLIENTS</p>
                <p>external or internal,</p>
                <p> evaluate service/ </p>
                <p>performance </p>
              </div>
            </div>
          </div>
          <div className="container4">
            <div className="heading4">
              <p>
                The rater will select from rating 01 being least and 05 being
                the best
              </p>
            </div>
            <img
             className="dark-grey-image"
             src={process.env.PUBLIC_URL + "/icons/Vector 212.png"}
             alt="Rating Scale"
           />
            <div className="scale-points">
              <div className="scale-point">01</div>
              <div className="scale-point">02</div>
              <div className="scale-point">03</div>
              <div className="scale-point">04</div>
              <div className="scale-point">05</div>
            </div>
            <div className="lastP">
              <p>
                <strong>Instruction to Rater/s:</strong>
              
                Rate statements using a scale of 1 to 5, where 1 indicates the
                lowest rating and 5 indicates the highest.
              </p>
            </div>
          </div>
        </div>
      
      </div>
  );
});

export default Home;
