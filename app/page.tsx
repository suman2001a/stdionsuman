"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  Clapperboard, 
  Users, 
  Play,
  Cake,
  Heart,
  MonitorPlay,
  Palette,
  Image as ImageIcon,
  MessageCircle,
  X,
  Mail,
  MapPin
} from "lucide-react";
import styles from "./page.module.css";

import { FaFacebook, FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SiDavinciresolve } from 'react-icons/si';

import heroBg from '../public/hero-bg.jpeg';
import servicesBanner from '../public/services-banner.png';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProjects(data);
      }
    };

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching approved reviews:", error);
        setReviews([{ name: "Error", text: error.message, rating: 5, is_approved: true }]);
      } else if (data) {
        setReviews(data);
      }
    };

    fetchProjects();
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMsg('');

    const { error } = await supabase.from('reviews').insert([
      { name: newReview.name, text: newReview.text, rating: newReview.rating }
    ]);

    setIsSubmitting(false);
    if (error) {
      console.error(error);
      setSubmitMsg(`Error: ${error.message || 'Unknown error'}`);
    } else {
      setSubmitMsg('Review submitted successfully! It will appear after approval.');
      setNewReview({ name: '', text: '', rating: 5 });
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setSubmitMsg('');
      }, 3000);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav} style={{ marginLeft: '550px', marginTop: '20px' }}>
          <Link href="#home" className={`${styles.navLink} ${styles.active}`}>Home</Link>
          <Link href="#about" className={styles.navLink}>About</Link>
          <Link href="#services" className={styles.navLink}>Services</Link>
          <Link href="#portfolio" className={styles.navLink}>Portfolio</Link>
          <Link href="#reviews" className={styles.navLink}>Reviews</Link>
          <Link href="#contact" className={styles.navLink}>Contact</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className={styles.heroSection}>
        <div className={styles.heroImageWrapper}>
          <Image 
            src={heroBg} 
            alt="Hero Background" 
            className={styles.heroImgResponsive}
          />
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
          <div className={styles.heroButtons}>
            <Link href="#portfolio" style={{ textDecoration: 'none' }}>
              <button className={styles.btnPrimary}>
                <Play size={18} fill="currentColor" />
                WATCH SHOWREEL
              </button>
            </Link>
            <Link href="#portfolio" style={{ textDecoration: 'none' }}>
              <button className={styles.btnSecondary}>
                VIEW MY WORK
              </button>
            </Link>
          </div>
          <div className={styles.followMe}>
            <span className={styles.followText}>FOLLOW ME</span>
            <div className={styles.socialIcons}>
              <a href="https://www.instagram.com/stud.iossquare?igsh=MTZ1c3Z3ZGMxNWFxaw==" target="_blank" rel="noopener noreferrer" className={`${styles.socialIconBtn} ${styles.ig}`}><FaInstagram /></a>
              <a href="https://www.tiktok.com/@s.square562?_r=1&_t=ZS-97qwHQbGMOQ" target="_blank" rel="noopener noreferrer" className={`${styles.socialIconBtn} ${styles.tk}`}><FaTiktok /></a>
              <a href="https://whatsapp.com/channel/0029Vb6EUyPIiRootljmTJ2h" target="_blank" rel="noopener noreferrer" className={`${styles.socialIconBtn} ${styles.wa}`}><FaWhatsapp /></a>
              <a href="https://www.facebook.com/profile.php?id=61582335014918" target="_blank" rel="noopener noreferrer" className={`${styles.socialIconBtn} ${styles.fb}`}><FaFacebook /></a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.about}>
        <div className={styles.aboutContent}>
          <div className={styles.sectionSubtitle}>About Me</div>
          <h2 className={`${styles.aboutName} ${styles.heading}`}>Hi, I&apos;m Sumanan</h2>
          <p className={styles.aboutDesc}>
            Professional Video Editor & Colorist with 5+ years of experience. I specialize in cinematic editing, color grading, sound design and creating visual stories that connect with people.
          </p>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <Star className={styles.statIcon} size={32} />
              <div>
                <span className={styles.statValue}>5+</span>
                <span className={styles.statLabel}>Years Experience</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Clapperboard className={styles.statIcon} size={32} />
              <div>
                <span className={styles.statValue}>200+</span>
                <span className={styles.statLabel}>Projects Completed</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Users className={styles.statIcon} size={32} />
              <div>
                <span className={styles.statValue}>100+</span>
                <span className={styles.statLabel}>Happy Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Works */}
      <section id="portfolio">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionSubtitle}>Recent Works</div>
        </div>
        {!selectedCategory ? (
          <div className={styles.categoryGrid}>
            {/* Show category covers */}
            {Array.from(new Set(projects.map(p => p.category))).map(category => {
              const categoryProjects = projects.filter(p => p.category === category);
              const coverProject = categoryProjects[0]; // most recent one

              return (
                <div key={String(category)} className={styles.categoryCard} onClick={() => setSelectedCategory(String(category))}>
                  <Image src={coverProject.thumbnail_url} alt={String(category)} fill className="object-cover" />
                  <div className={styles.categoryOverlay}>
                    <div className={styles.playBtnCategory}><Play size={24} fill="#fff" /></div>
                    <span className={styles.categoryTitle}>{String(category)}</span>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', width: '100%', color: '#aaa' }}>
                <p>No projects uploaded yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Upload your works from the admin panel to see them here!</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: '20px', maxWidth: '1200px', margin: '0 auto'}}>
              <h3 style={{textTransform: 'uppercase', color: '#FFC107', fontSize: '1.2rem'}}>{selectedCategory}</h3>
              <button className={styles.btnSecondary} onClick={() => setSelectedCategory(null)} style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                &larr; Back
              </button>
            </div>
            <div className={styles.carouselContainer}>
              {projects.filter(p => p.category === selectedCategory).map((project, idx) => (
                <div key={project.id} className={styles.workCard}>
                  <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover" />
                  <div className={styles.workOverlay}>
                    <button className={styles.playBtn} onClick={() => window.open(project.video_url, '_blank')}><Play size={24} fill="#fff" /></button>
                    <span className={styles.workTitle} style={{textAlign: 'center'}}>{project.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>


      {/* My Services */}
      <section id="services" style={{ padding: '60px 0', width: '100%' }}>
        <div style={{ width: '100%', padding: '0 20px', display: 'flex', justifyContent: 'center' }}>
          <Image 
            src={servicesBanner} 
            alt="My Services" 
            style={{ width: '100%', maxWidth: '1200px', height: 'auto', borderRadius: '12px', margin: '0 auto' }} 
          />
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews">
        <div className={styles.sectionSubtitle}>Clients Love <Heart size={16} fill="#FFC107" color="#FFC107" /></div>
        
        <div className={styles.reviewsGrid}>
          {reviews.map((review, index) => (
            <div className={styles.reviewCard} key={index}>
              <div className={styles.reviewerAvatar}>{review.name.charAt(0)}</div>
              <div className={styles.reviewContent}>
                <h4>{review.name}</h4>
                <p>{review.text}</p>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < review.rating ? '#FFC107' : '#555' }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p style={{textAlign: 'center', width: '100%', color: '#aaa'}}>No reviews yet.</p>}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className={styles.btnSecondary} onClick={() => setIsReviewModalOpen(true)}>
            Submit a Review
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className={styles.footer}>
        <div className={styles.footerCta}>
          <div className={styles.ctaText}>
            <h3>Have a project in mind?</h3>
            <p>Let&apos;s create something amazing together!</p>
          </div>
          <div className={styles.contactInfoContainer}>
            <div className={styles.contactInfo}>
              <div className={styles.contactIcon}><MessageCircle size={24} /></div>
              <div className={styles.contactDetails}>
                <h4>+94 76 801 9190</h4>
              </div>
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactIcon}><Mail size={24} /></div>
              <div className={styles.contactDetails}>
                <h4>
                  <a href="mailto:studiossquare11@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                    studiossquare11@gmail.com
                  </a>
                </h4>
              </div>
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactIcon}><MapPin size={24} /></div>
              <div className={styles.contactDetails}>
                <h4>Ilavalai, Jaffna</h4>
              </div>
            </div>
          </div>
          <Link href="https://wa.me/94768019190" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button className={styles.btnPrimary}>
              <MessageCircle size={18} />
              WhatsApp Me
            </button>
          </Link>
        </div>
        
        <div className={styles.copyright}>
          &copy; 2024 S Square Studio. All Rights Reserved.
        </div>
      </footer>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setIsReviewModalOpen(false)}>
              <X size={24} />
            </button>
            <h3 style={{marginBottom: '20px'}}>Submit a Review</h3>
            {submitMsg ? (
              <p style={{color: submitMsg.includes('Error') ? '#ff4d4f' : '#52c41a'}}>{submitMsg}</p>
            ) : (
              <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                <div className={styles.formGroup}>
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newReview.name} 
                    onChange={e => setNewReview({...newReview, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Your Review</label>
                  <textarea 
                    required 
                    rows={4}
                    value={newReview.text} 
                    onChange={e => setNewReview({...newReview, text: e.target.value})}
                    placeholder="Tell us about your experience..."
                  ></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label>Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5" 
                    required 
                    value={newReview.rating} 
                    onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  />
                </div>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
