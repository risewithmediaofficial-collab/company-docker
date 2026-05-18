import mongoose from 'mongoose';
import User from './models/user.model.js';
import Client from './models/client.model.js';
import dotenv from 'dotenv';

dotenv.config();

const fixMissingClients = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const clientUsers = await User.find({ role: 'client' });
    console.log(`Found ${clientUsers.length} client users`);

    for (const user of clientUsers) {
      const existingClient = await Client.findOne({ userId: user._id });
      if (!existingClient) {
        console.log(`Creating missing client record for ${user.name} (${user.email})`);
        const client = await Client.create({
          name: user.name,
          email: user.email,
          company: user.name,
          status: 'onboarding',
          userId: user._id,
          portalEnabled: true,
        });

        user.clientId = client._id;
        await user.save();
        console.log(`Created and linked client record ${client._id}`);
      } else {
        console.log(`Client record already exists for ${user.name}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixMissingClients();
