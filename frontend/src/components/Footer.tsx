import { Home, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/0">
                <img src="/bims-logo.svg" alt="BIMS" className="w-10 h-10 object-cover" />
              </div>
              <span className="text-xl font-bold text-card-foreground">BIMS</span>
            </div>
            <p className="text-muted-foreground">
              Connecting trusted brokers with clients for seamless property and vehicle transactions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Browse Listings</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">For Brokers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 mt-0.5 text-primary" />
                <span>+251 123 456 789</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 mt-0.5 text-primary" />
                <span>info@bims.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 BIMS. Developed by Adey Assefa, Mola Munye, and Team. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
