import sqlite3
import os
import json

DB_FILE = os.path.join(os.path.dirname(__file__), "backend", "doraemon_study.db")

def setup_pm2():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Clear old duplicate test courses
    cursor.execute("DELETE FROM document_chunks")
    cursor.execute("DELETE FROM quiz_attempts")
    cursor.execute("DELETE FROM quizzes")
    cursor.execute("DELETE FROM lessons")
    cursor.execute("DELETE FROM topics")
    cursor.execute("DELETE FROM sessions")
    cursor.execute("DELETE FROM courses")

    course_id = "course_pm2"
    course_title = "Product Management 2"
    course_desc = "Advanced Product Management, Strategy, Metrics, User Journey, Growth & Execution."

    cursor.execute("""
    INSERT INTO courses (id, title, description, filename, file_type, file_path, status, status_message, progress_percent, total_slides_or_pages, processed_slides_or_pages, coverage_data)
    VALUES (?, ?, ?, 'Product_Management_2.pptx', 'pptx', 'uploads/pm2_placeholder.pptx', 'ready', 'Ready to Learn! Upload session PPTs/PDFs anytime.', 100, 15, 15, ?)
    """, (
        course_id, course_title, course_desc,
        json.dumps({
            "total_units": 15,
            "processed_units": 15,
            "unreadable_units": [],
            "topic_count": 3,
            "warnings": []
        })
    ))

    # Pre-defined clean Sessions for Product Management 2
    sessions_data = [
        ("pm2_s1", "Session 1: Product Strategy & Market Discovery", 1, "Defining product vision, market opportunities, and strategic positioning."),
        ("pm2_s2", "Session 2: User Research, Personas & Problem Framing", 2, "Customer empathy interviews, JTBD (Jobs To Be Done), and pain-point identification."),
        ("pm2_s3", "Session 3: Value Proposition & Product-Market Fit", 3, "Designing value propositions, MVP testing, and PMF validation signals."),
        ("pm2_s4", "Session 4: Product Metrics, North Star & OKRs", 4, "AARRR Pirate Funnel, North Star Metric formulation, and business impact OKRs."),
        ("pm2_s5", "Session 5: Prioritization & Feature Roadmapping", 5, "RICE scoring, Kano Model, MoSCoW, opportunity scoring, and agile roadmaps."),
        ("pm2_s6", "Session 6: Go-to-Market (GTM) & Launch Strategy", 6, "Product marketing, channel positioning, pricing strategies, and launch loops."),
        ("pm2_s7", "Session 7: Experimentation, A/B Testing & Data", 7, "Hypothesis generation, sample size calculation, statistical significance, and split testing."),
        ("pm2_s8", "Session 8: Retention, Growth Loops & Monetization", 8, "Cohort analysis, churn prevention, viral loops, and sustainable monetization models.")
    ]

    for s_id, s_title, s_order, s_desc in sessions_data:
        cursor.execute("""
        INSERT INTO sessions (id, course_id, title, order_index, description)
        VALUES (?, ?, ?, ?, ?)
        """, (s_id, course_id, s_title, s_order, s_desc))

    # Add 2 high-quality starter topics in Session 1 for immediate exploration
    topic_1 = {
        "id": "pm2_t1",
        "session_id": "pm2_s1",
        "course_id": course_id,
        "title": "Product Vision & Strategy Framework",
        "order_index": 1,
        "source_pages": [1, 2, 3],
        "summary": "Core principles of translating company mission into a clear, differentiated product strategy.",
        "importance": "High",
        "simple_definition": "Product Strategy is the overarching high-level plan that outlines what a product should achieve, who it serves, and how it will succeed in the market against competitors.",
        "easy_english": "Think of Product Strategy as your navigation system. Before you write code or design screens, you need to know where you are going, why users care, and how you will outcompete alternatives.",
        "hinglish": "Product Strategy ek product ka blueprint hota hai jo batata hai ki product kiske liye ban raha hai, user ki konsi badi problem solve karega, aur market me rivals se aage kaise niklega.",
        "step_by_step": [
            {"step": 1, "title": "Identify Target Customer & Problem", "description": "Clearly define the user segment suffering from an urgent, unaddressed friction."},
            {"step": 2, "title": "Formulate Differentiated Value Proposition", "description": "Articulate why your solution is 10x better than existing alternatives (speed, cost, delight)."},
            {"step": 3, "title": "Define Sustainable Moat & Economics", "description": "Establish network effects, economies of scale, or proprietary tech that protects the product long-term."}
        ],
        "key_points": [
            "Vision is the aspirational destination; Strategy is the roadmap to get there; Execution is the daily work.",
            "Differentiated positioning stops you from competing merely on price.",
            "Every product decision must align with the strategic pillars."
        ],
        "real_life_examples": [
            "Apple iPhone strategy: Seamless hardware-software integration paired with a closed, secure ecosystem.",
            "Netflix: Transitioned from DVD rental to cloud streaming, and then to proprietary original content studio."
        ],
        "indian_examples": [
            "Zepto: Hyper-local 10-minute grocery delivery strategy enabled by micro-warehouses (dark stores) optimized for dense Indian metros.",
            "Zerodha: Zero-brokerage product strategy that democratized retail stock investing in India without spending money on marketing.",
            "UPI / PhonePe: QR-code led merchant payment strategy that eliminated payment friction for street vendors and supermarkets alike."
        ],
        "terminology": [
            {"term": "Product Vision", "meaning": "The ultimate long-term future state the product strives to create for users and society."},
            {"term": "Value Proposition", "meaning": "The explicit statement of concrete benefits a customer receives when using the product."},
            {"term": "Moat (Competitive Advantage)", "meaning": "A defensible barrier that prevents competitors from easily copying your market share."}
        ],
        "formulas": [
            {"formula": "Customer Value = Total Perceived Benefits - Total Perceived Costs", "explanation": "A product wins when the perceived benefits far exceed the financial, cognitive, and switching costs."}
        ],
        "diagram": {
            "type": "strategy_pyramid",
            "title": "The Strategic Product Hierarchy",
            "steps": ["1. Company Mission", "2. Product Vision", "3. Strategic Pillars", "4. Product Roadmap", "5. Daily Sprints & Features"]
        },
        "comparisons": {
            "concept_a": "Product Strategy",
            "concept_b": "Product Roadmap",
            "differences": [
                {"dimension": "Focus", "a": "Why and What (Direction)", "b": "When and How (Timeline)"},
                {"dimension": "Lifespan", "a": "Multi-year, stable", "b": "Quarterly or dynamic"},
                {"dimension": "Audience", "a": "Leadership, Investors & Team", "b": "Engineering, Design & Stakeholders"}
            ]
        },
        "exam_notes": "Exam focus: Be ready to explain the three pillars of Product Strategy (Target Segment, Value Proposition, Strategic Advantage). Cite Indian case studies like Zerodha's bootstrapped low-cost strategy or Swiggy's convenience ecosystem.",
        "short_questions": [
            {"q": "What is the primary difference between a product roadmap and product strategy?", "a": "Strategy dictates direction and 'why', whereas a roadmap illustrates delivery timelines and feature milestones."},
            {"q": "Name two major types of product moats in the Indian digital ecosystem.", "a": "Network effects (e.g. PhonePe UPI network) and low-cost operational efficiency (e.g. Zerodha)."}
        ],
        "long_questions": [
            {"q": "Critically analyze how Zepto crafted its product strategy to compete against established players like Blinkit and Swiggy Instamart.", "a": "Zepto identified that delivery latency was the critical purchase barrier in urban grocery shopping. By establishing high-density dark stores within a 2-3km radius and investing in proprietary inventory prediction algorithms, Zepto engineered ultra-rapid picking and dispatching, establishing a distinct brand identity before competitors caught up."}
        ],
        "revision_summary": "Product Strategy defines customer segment, unique value proposition, and long-term defensibility. Vision is the goal, strategy is the path, and roadmap is the execution sequence.",
        "quiz": [
            {
                "id": "q1",
                "question": "Which of the following best defines Product Strategy?",
                "options": [
                    "A list of JIRA tickets scheduled for the next sprint",
                    "A high-level plan defining the target customer, value proposition, and competitive moat",
                    "The marketing budget allocated for social media ads",
                    "The visual design mockups created in Figma"
                ],
                "correct_index": 1,
                "explanation": "Product Strategy is the overarching directional blueprint that connects company vision with actionable product decisions."
            },
            {
                "id": "q2",
                "question": "Which Indian startup utilized a zero-brokerage product strategy to disrupt retail finance?",
                "options": ["Zerodha", "CRED", "Byju's", "Oyo"],
                "correct_index": 0,
                "explanation": "Zerodha introduced discount brokering in India, eliminating trade commission fees for long-term equity investors."
            },
            {
                "id": "q3",
                "question": "What is the formula for Customer Value?",
                "options": [
                    "Perceived Benefits - Perceived Costs",
                    "Revenue * Total Active Users",
                    "Acquisition Cost / Churn Rate",
                    "Total Features * Engineering Hours"
                ],
                "correct_index": 0,
                "explanation": "Customer Value represents the net utility derived when perceived benefits outweigh all monetary and cognitive costs."
            }
        ]
    }

    cursor.execute("""
    INSERT INTO topics (id, session_id, course_id, title, order_index, source_pages_json, summary, importance, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    """, (topic_1["id"], topic_1["session_id"], topic_1["course_id"], topic_1["title"], topic_1["order_index"], json.dumps(topic_1["source_pages"]), topic_1["summary"], topic_1["importance"]))

    cursor.execute("""
    INSERT INTO lessons (
        id, topic_id, course_id, title, source_pages_json,
        simple_definition, easy_english, hinglish, step_by_step_json,
        key_points_json, real_life_examples_json, indian_examples_json,
        terminology_json, formulas_json, diagrams_json, comparisons_json,
        exam_notes, short_questions_json, long_questions_json,
        revision_summary, simplified_mode_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"lesson_{topic_1['id']}", topic_1["id"], topic_1["course_id"], topic_1["title"], json.dumps(topic_1["source_pages"]),
        topic_1["simple_definition"], topic_1["easy_english"], topic_1["hinglish"],
        json.dumps(topic_1["step_by_step"]), json.dumps(topic_1["key_points"]),
        json.dumps(topic_1["real_life_examples"]), json.dumps(topic_1["indian_examples"]),
        json.dumps(topic_1["terminology"]), json.dumps(topic_1["formulas"]),
        json.dumps(topic_1["diagram"]), json.dumps(topic_1["comparisons"]),
        topic_1["exam_notes"], json.dumps(topic_1["short_questions"]),
        json.dumps(topic_1["long_questions"]), topic_1["revision_summary"],
        json.dumps({"summary": topic_1["revision_summary"]})
    ))

    cursor.execute("""
    INSERT INTO quizzes (id, topic_id, course_id, title, questions_json)
    VALUES (?, ?, ?, ?, ?)
    """, (f"quiz_{topic_1['id']}", topic_1["id"], topic_1["course_id"], f"Quiz: {topic_1['title']}", json.dumps(topic_1["quiz"])))

    # Seed Complete Document Summary covering all 8 points (Requirement 6 & 8)
    cursor.execute("DELETE FROM course_summaries WHERE course_id = ?", (course_id,))
    cursor.execute("""
    INSERT INTO course_summaries (
        id, course_id, what_is_it_about, main_topics_json, what_will_learn_json,
        important_concepts_json, how_topics_connected_text, connections_json,
        understand_first_json, exam_points_json, conclusion, quick_summary,
        detailed_summary, mermaid_syntax
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        f"summary_{course_id}", course_id,
        "Product Management 2 is an advanced curriculum covering end-to-end product lifecycle management: strategic vision, customer discovery, PMF validation, quantitative growth metrics, prioritization algorithms, go-to-market strategies, and retention modeling.",
        json.dumps([
            {"title": "Product Vision & Strategy Framework", "brief": "Translating market opportunities into differentiated value propositions and defensible moats."},
            {"title": "User Research & Problem Framing", "brief": "Conducting customer empathy interviews, Jobs-To-Be-Done (JTBD), and identifying urgent user pain points."},
            {"title": "Value Proposition & PMF Signals", "brief": "Designing Minimum Viable Products (MVPs) and measuring retention curve flattening for PMF."},
            {"title": "Product Metrics & North Star", "brief": "AARRR Pirate Funnel, North Star metric formulation, and OKR business impact trees."},
            {"title": "Prioritization Frameworks (RICE, Kano)", "brief": "Quantifying reach, impact, confidence, and effort to build objective sprint roadmaps."}
        ]),
        json.dumps([
            "Formulate defensible product strategies that outperform competitors without price wars.",
            "Define customer personas, user journey maps, and uncover underserved JTBD frictions.",
            "Select and monitor a company-wide North Star Metric aligned with core customer value.",
            "Apply RICE and Kano models to prioritize feature requests and manage engineering trade-offs.",
            "Design viral growth loops and cohort retention curves to build sustainable unit economics."
        ]),
        json.dumps([
            "Product-Market Fit (PMF): The tipping point where retention curves flatten and word-of-mouth drives organic adoption.",
            "Customer Value Equation: Value = Perceived Benefits - Perceived Costs (monetary, cognitive, and friction).",
            "AARRR Funnel: Acquisition -> Activation -> Retention -> Referral -> Revenue.",
            "RICE Scoring Formula: (Reach * Impact * Confidence) / Effort."
        ]),
        "Product Management 2 follows an organic product trajectory: it starts with customer problem discovery (Why & Who), transitions to MVP design and product-market fit (What), establishes data-driven metrics and prioritization frameworks (Which), and concludes with go-to-market scaling, retention, and monetization (How).",
        json.dumps([
            {"from_topic": "Product Vision & Strategy Framework", "to_topic": "User Research & Problem Framing", "relation_type": "builds_upon", "explanation": "Strategic vision identifies the high-level customer segment, which user research then validates through qualitative empathy interviews."},
            {"from_topic": "User Research & Problem Framing", "to_topic": "Value Proposition & PMF", "relation_type": "prerequisite", "explanation": "You cannot design an effective value proposition without an acute understanding of the customer's unmet Job To Be Done."},
            {"from_topic": "Value Proposition & PMF", "to_topic": "Product Metrics & North Star", "relation_type": "builds_upon", "explanation": "Once PMF is achieved, North Star metrics quantify value delivery and prevent premature scaling."},
            {"from_topic": "Product Metrics & North Star", "to_topic": "Prioritization Frameworks (RICE)", "relation_type": "informs", "explanation": "Metrics reveal friction points in the user journey, directing which features receive high RICE priority."}
        ]),
        json.dumps([
            "The difference between Product Vision (destination), Strategy (pathway), and Roadmap (execution sequence).",
            "Basic qualitative research methodologies (JTBD vs simple feature requests).",
            "Fundamental business models (B2B SaaS, B2C marketplace, D2C)."
        ]),
        json.dumps([
            "Exam Focus: Be prepared to derive and calculate RICE scores given quantitative project parameters.",
            "Memorize the 5 stages of the AARRR Pirate Funnel and distinguish Activation from Acquisition.",
            "Cite Indian startup case studies: Zepto (10-min grocery logistics moat), Zerodha (zero-brokerage bootstrapped growth), and PhonePe (UPI transaction network effects).",
            "Be ready to sketch the Strategy Pyramid: Mission -> Vision -> Strategic Pillars -> Roadmap -> Features."
        ]),
        "Product Management 2 teaches you to think like an empathetic CEO of a product. By grounding every feature in customer problem validation and disciplined data measurement, PMs build products that customers truly love and businesses can scale profitably.",
        "Product Management 2 is an 8-session mastercourse guiding students through product strategy, customer research, PMF validation, metrics (AARRR, North Star), prioritization (RICE, Kano), and go-to-market execution with Indian startup case studies.",
        "## Product Management 2: Academic Master Overview\n\nThis course delivers deep pedagogical mastery of product lifecycle execution across 8 comprehensive sessions. Students transition from intuitive problem solvers to structured product leaders capable of evaluating market opportunities, defining metrics, and driving cross-functional alignment.",
        "flowchart TD\n    N0[\"1. Product Vision & Strategy\"]\n    N1[\"2. User Research & JTBD\"]\n    N2[\"3. Value Proposition & PMF\"]\n    N3[\"4. Product Metrics & North Star\"]\n    N4[\"5. RICE Prioritization\"]\n    N5[\"6. Go-To-Market & Growth\"]\n    N0 -->|Guides| N1\n    N1 -->|Informs| N2\n    N2 -->|Validates| N3\n    N3 -->|Prioritizes| N4\n    N4 -->|Executes| N5"
    ))

    # Initialize default student profile (Himani) if not exists
    cursor.execute("SELECT id FROM student_profiles WHERE id = 'student_himani'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO student_profiles (id, name, total_xp, level, current_streak, last_active_date, completed_topics_json, weak_topics_json, badges_json)
        VALUES ('student_himani', 'Himani', 150, 1, 1, date('now'), '[]', '[]', '["Novice Gadgeteer", "Pocket Explorer"]')
        """)

    # Reset user progress to clean state
    cursor.execute("UPDATE user_progress SET total_xp = 150, level = 1, current_streak = 1, completed_topics_json = '[]', weak_topics_json = '[]'")

    conn.commit()
    conn.close()
    print("Database successfully reset and seeded for Product Management 2!")

if __name__ == "__main__":
    setup_pm2()
