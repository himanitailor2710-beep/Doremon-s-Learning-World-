"""
Generates sample PPTX and PDF college study materials for testing Doraemon AI Study World.
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "sample_materials")
os.makedirs(SAMPLE_DIR, exist_ok=True)

def create_sample_pptx():
    pptx_path = os.path.join(SAMPLE_DIR, "Computer_Networks_and_Cloud_Architecture.pptx")
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(5.625)

    blank_layout = prs.slide_layouts[6]

    # Helper to add standard slide
    def add_styled_slide(title_text, subtitle_or_paras, bullets=None, table_data=None):
        slide = prs.slides.add_slide(blank_layout)

        # Title
        tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(8.4), Inches(0.8))
        tf = tx_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = RGBColor(2, 136, 209)

        # Body paragraphs / Subtitle
        top = 1.3
        if subtitle_or_paras:
            tx_box2 = slide.shapes.add_textbox(Inches(0.8), Inches(top), Inches(8.4), Inches(1.0))
            tf2 = tx_box2.text_frame
            tf2.word_wrap = True
            for i, para in enumerate(subtitle_or_paras):
                p2 = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
                p2.text = para
                p2.font.size = Pt(14)
                p2.font.color.rgb = RGBColor(30, 41, 59)
            top += 0.8

        # Bullets
        if bullets:
            tx_box3 = slide.shapes.add_textbox(Inches(0.8), Inches(top), Inches(8.4), Inches(1.8))
            tf3 = tx_box3.text_frame
            tf3.word_wrap = True
            for i, b in enumerate(bullets):
                p3 = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
                p3.text = f"• {b}"
                p3.font.size = Pt(13)
                p3.font.color.rgb = RGBColor(51, 65, 85)
            top += 1.6

        # Table
        if table_data:
            rows = len(table_data)
            cols = len(table_data[0])
            table_shape = slide.shapes.add_table(rows, cols, Inches(0.8), Inches(top), Inches(8.4), Inches(1.4))
            table = table_shape.table
            for r_idx, row in enumerate(table_data):
                for c_idx, val in enumerate(row):
                    cell = table.cell(r_idx, c_idx)
                    cell.text = str(val)
                    for cp in cell.text_frame.paragraphs:
                        cp.font.size = Pt(11)
                        if r_idx == 0:
                            cp.font.bold = True
                            cp.font.color.rgb = RGBColor(2, 136, 209)

        return slide

    # Slide 1: Course Title
    add_styled_slide(
        "Computer Networks and Cloud Architecture",
        ["Session 1 to 4: Comprehensive College Lecture Series", "Prof. K. Sharma — Department of Computer Science & Engineering"],
        [
            "Fundamental models: OSI 7-Layer and TCP/IP stack",
            "Packet transmission physics, queuing delays, and formula calculations",
            "Modern application protocols: HTTP/3, DNS root servers, and WebSocket streaming",
            "Cloud resilience: Microservices, message queues, and Indian tech case studies (Jio, UPI, Zomato)"
        ]
    )

    # Slide 2: OSI vs TCP/IP
    add_styled_slide(
        "Module 1: The OSI Reference Model and TCP/IP",
        ["The Open Systems Interconnection (OSI) conceptual framework divides network communications into seven logical layers."],
        [
            "Layer 7 (Application): Interface for network applications (HTTP, SMTP, FTP)",
            "Layer 4 (Transport): End-to-end process communication, flow control, and error recovery (TCP, UDP)",
            "Layer 3 (Network): Logical addressing, subnetting, and packet routing across networks (IPv4, IPv6, ICMP)",
            "Layer 2 (Data Link): Physical MAC addressing, frame framing, error detection (Ethernet, Wi-Fi 802.11)"
        ],
        table_data=[
            ["Layer Name", "Protocol Data Unit (PDU)", "Key Responsibility", "Primary Hardware"],
            ["Application", "Data / Message", "User interaction & encoding", "Gateways / End hosts"],
            ["Transport", "Segment (TCP) / Datagram (UDP)", "Reliability, port multiplexing", "Firewalls / OS Sockets"],
            ["Network", "Packet", "Routing & IP addressing", "Routers / Layer 3 Switches"],
            ["Data Link", "Frame", "Hop-to-hop transfer, MAC", "Network Switches / Bridges"]
        ]
    )

    # Slide 3: Packet Switching & Formulas
    add_styled_slide(
        "Module 2: Packet Switching and Latency Equations",
        [
            "In packet-switched networks, messages are partitioned into discrete packets of length L bits.",
            "Total nodal delay is the sum of processing delay, queuing delay, transmission delay, and propagation delay."
        ],
        [
            "Transmission Delay Formula: D_trans = L / R (where L = packet size in bits, R = link bandwidth in bps)",
            "Propagation Delay Formula: D_prop = d / s (where d = distance in meters, s = signal propagation speed ~ 2x10^8 m/s)",
            "Queuing Delay: Dependent on traffic intensity I = (a * L) / R. When I approaches 1, queuing delay explodes exponentially.",
            "Real-World Indian Analogy: High congestion at toll plazas on the Mumbai-Pune Expressway during weekend holidays."
        ]
    )

    # Slide 4: Application Layer & DNS
    add_styled_slide(
        "Module 3: DNS Query Resolution and Web Protocols",
        [
            "The Domain Name System (DNS) translates human-readable hostnames (e.g., www.isro.gov.in) into 32-bit IP addresses.",
            "Operates primarily over UDP port 53 for speed, switching to TCP for zone transfers and large responses."
        ],
        [
            "Iterative vs Recursive queries: Local DNS resolvers query Root servers, TLD servers (.in, .com), and Authoritative servers.",
            "HTTP/1.1 vs HTTP/2 vs HTTP/3: HTTP/2 introduced multiplexing over a single TCP stream; HTTP/3 uses QUIC over UDP to eliminate Head-of-Line blocking.",
            "DNS Caching: Time To Live (TTL) values prevent redundant cross-continental lookups.",
            "Exam Tip: Always illustrate the 4-step DNS resolution hierarchy in 5-mark university exam questions."
        ]
    )

    # Slide 5: Cloud Architecture & Indian Tech Case Studies
    add_styled_slide(
        "Module 4: Distributed Cloud Microservices & Scalability",
        [
            "Modern web systems break monolithic architectures into loosely coupled microservices communicating via REST and gRPC.",
            "Horizontal scaling, containerization with Docker, and orchestration using Kubernetes provide fault tolerance."
        ],
        [
            "Case Study 1: UPI / NPCI Real-Time Transactions — Handling 12+ billion transactions per month using distributed ACID settlement.",
            "Case Study 2: Reliance Jio 5G Core — Software-defined networking routing petabytes of mobile traffic across India.",
            "Case Study 3: Zomato Delivery Dispatch — Hyperlocal geospatial search algorithms matching food orders with riders in under 500ms.",
            "Case Study 4: Flipkart Big Billion Days — Elastic auto-scaling clusters handling 100x traffic surges without system crashes."
        ]
    )

    prs.save(pptx_path)
    print(f"Created sample PPTX: {pptx_path}")

def create_sample_pdf():
    pdf_path = os.path.join(SAMPLE_DIR, "Operating_Systems_and_Concurrency.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0288D1"),
        spaceAfter=12
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#01579B"),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=8
    )
    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        leftIndent=15,
        spaceAfter=4
    )

    story = []

    # Page 1: Processes and CPU Scheduling
    story.append(Paragraph("Operating Systems: Concurrency, Synchronization & Memory", title_style))
    story.append(Paragraph("<b>Chapter 1: Process Management & CPU Scheduling Algorithms</b>", h2_style))
    story.append(Paragraph(
        "A process is an instance of a computer program in execution, consisting of program code, current activity represented by the program counter, stack, data section, and heap memory. In contrast, a thread is a lightweight unit of CPU utilization that shares address space with peer threads.",
        body_style
    ))
    story.append(Paragraph("• <b>Process Control Block (PCB):</b> Stores PID, Process State (New, Ready, Running, Waiting, Terminated), CPU registers, and I/O status.", bullet_style))
    story.append(Paragraph("• <b>Context Switch:</b> Saving the state of the active process and restoring the state of the scheduled process; pure operational overhead.", bullet_style))
    story.append(Paragraph("• <b>First-Come, First-Served (FCFS):</b> Non-preemptive scheduling prone to the convoy effect where short processes wait behind long CPU bursts.", bullet_style))
    story.append(Paragraph("• <b>Shortest Job First (SJF):</b> Mathematically optimal for minimum average waiting time; requires burst time prediction.", bullet_style))
    story.append(Paragraph("• <b>Round Robin (RR):</b> Preemptive time-sliced scheduling with quantum q; optimal for interactive time-sharing systems.", bullet_style))
    story.append(Spacer(1, 15))

    # Page 2: Synchronization & Deadlocks
    story.append(Paragraph("<b>Chapter 2: Concurrency, Critical Sections & Deadlock Avoidance</b>", h2_style))
    story.append(Paragraph(
        "When concurrent processes share resources (such as memory or files), race conditions occur if the outcome depends on the order of execution. The Critical Section Problem requires Mutual Exclusion, Progress, and Bounded Waiting.",
        body_style
    ))
    story.append(Paragraph("• <b>Mutex Locks:</b> Binary synchronization primitives utilizing acquire() and release() operations with atomic test-and-set instructions.", bullet_style))
    story.append(Paragraph("• <b>Semaphores:</b> Integer variables accessed through atomic wait(S) [P] and signal(S) [V] functions; counting semaphores manage finite resource pools.", bullet_style))
    story.append(Paragraph("• <b>Deadlock Coffman Conditions:</b> Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.", bullet_style))
    story.append(Paragraph("• <b>Banker's Algorithm:</b> Deadlock avoidance strategy. State is safe if Need matrix <= Available vector: Need[i][j] = Max[i][j] - Allocation[i][j].", bullet_style))
    story.append(Paragraph("• <b>Indian Industry Application (Zerodha Kite):</b> Low-latency lock-free ring buffers in memory to broadcast real-time stock quotes to millions of traders without deadlocks.", bullet_style))
    story.append(Spacer(1, 15))

    # Page 3: Virtual Memory & Paging
    story.append(Paragraph("<b>Chapter 3: Virtual Memory Management & Page Replacement</b>", h2_style))
    story.append(Paragraph(
        "Virtual memory decouples the user logical memory from physical memory, permitting the execution of processes that require larger memory spaces than physically installed RAM.",
        body_style
    ))
    story.append(Paragraph("• <b>Paging Mechanism:</b> Logical address space is divided into fixed-size Pages; physical memory into Frames. Handled by Memory Management Unit (MMU) with Translation Lookaside Buffer (TLB).", bullet_style))
    story.append(Paragraph("• <b>Page Fault Rate Formula:</b> Effective Access Time (EAT) = (1 - p) * ma + p * (Page Fault Overhead), where p is probability of page fault and ma is memory access time.", bullet_style))
    story.append(Paragraph("• <b>Least Recently Used (LRU):</b> Replaces the frame that has not been accessed for the longest period of time; obeys Belady's anomaly protection.", bullet_style))
    story.append(Paragraph("• <b>Thrashing:</b> High paging activity where CPU spends more time swapping pages in/out of disk than executing user instructions.", bullet_style))

    doc.build(story)
    print(f"Created sample PDF: {pdf_path}")

if __name__ == "__main__":
    create_sample_pptx()
    create_sample_pdf()
