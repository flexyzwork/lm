import { FileText } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="footer">
      {/* ✅ 배너 추가 (너비 49.99rem로 정렬) */}
      <div className="footer__banner flex justify-center mb-4">
        <Link href="https://blog.flexyz.work" passHref legacyBehavior>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="footer__banner-link flex items-center gap-3 px-6 py-3 rounded-sm bg-gray-900 text-white-50 text-sm  shadow-md transition-all duration-300 hover:bg-gray-800 w-xl text-center"
          >
            <FileText className="w-6 h-6 text-white-50" />
            <span>Tech Blog</span>
          </a>
        </Link>
      </div>
      <p>&copy; {currentYear} FLEXYZ. All Rights Reserved.</p>
      <div className="footer__links">
        {['About', 'Privacy Policy', 'Licensing', 'Contact'].map((item) => (
          <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} className="footer__link" scroll={false}>
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Footer;
