'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { collection, deleteDoc, doc, getDoc, query, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, {
          quantity: quantity - 1,
        });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      bgcolor="black" 
      color="white"
      p={{ xs: 2, md: 0 }}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          width={{ xs: '90%', md: 400 }}
          bgcolor="black"
          border="2px solid white"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="h3" color="white">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
              InputProps={{
                style: { color: 'white', border: '2px solid white' },
              }}
              InputLabelProps={{
                style: { color: 'white' },
              }}
            />
            <Button
              variant="outlined"
              style={{ border: '2px solid white', color: 'white' }}
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              sx={{ fontSize: '0.8rem', padding: '4px 8px', minWidth: 'auto' }}
            >
              ADD
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={() => { handleOpen(); }}>ADD New Item</Button>
      <Box
        border="2px solid white"
        width={{ xs: '100%', md: '800px' }} // Responsive width
        maxHeight="calc(100vh - 200px)" // Max height relative to viewport
        overflowY="auto"
        sx={{ overflowX: 'hidden' }}
      >
        <Box
          width="100%"
          bgcolor="black"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderBottom="2px solid white"
          p={2}
        >
          <Typography variant="h2" color="white" textAlign="center">Inventory Items</Typography>
        </Box>
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gap={2}
          p={2}
        >
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }} // Responsive direction
              justifyContent={{ xs: 'center', sm: 'space-between' }} // Responsive justification
              alignItems="center" // Center alignment for all items
              bgcolor="black"
              padding={2}
              border="2px solid white"
              sx={{ gap: 2 }}
            >
              <Typography variant="h4" color="white" textAlign="center" sx={{ flex: 1 }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h5" color="white" textAlign="center" sx={{ flex: 1 }}>
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flex: 1, justifyContent: 'center', marginTop: { xs: 2, sm: 0 } }}>
                <Button
                  variant="contained"
                  onClick={() => addItem(name)}
                  sx={{
                    fontSize: '0.8rem', padding: '4px 8px', minWidth: 'auto',
                  }}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                  sx={{
                    fontSize: '0.8rem', padding: '4px 8px', minWidth: 'auto',
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
