import React, { forwardRef } from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClass?: string;
  as?: 'section' | 'footer';
  bg?: React.ReactNode;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, className = '', containerClass = '', as: Tag = 'section', bg, ...rest }, ref) => (
    <Tag
      ref={ref as any}
      className={`py-14 md:py-32 relative bg-[#050505] overflow-hidden ${className}`}
      {...rest}
    >
      {bg}
      <div className={`container mx-auto px-6 relative z-10 ${containerClass}`}>
        {children}
      </div>
    </Tag>
  )
);

Section.displayName = 'Section';
export default Section;
