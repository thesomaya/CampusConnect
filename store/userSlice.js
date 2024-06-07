import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "users",
    initialState: {
        storedUsers: {},
        blockedUsers: {}
    },
    reducers: {
        setStoredUsers: (state, action) => {
            const newUsers = action.payload.newUsers;
            const existingUsers = state.storedUsers;

            const usersArray = Object.values(newUsers);
            for (let i = 0; i < usersArray.length; i++) {
                const userData = usersArray[i];
                existingUsers[userData.userId] = userData;
            }

            state.storedUsers = existingUsers;
        },
        updateBlockStatus: (state, action) => {
            const { userId, blocked } = action.payload;
            state.blockedUsers[userId] = blocked;
        }
    }
});
export const { setStoredUsers, updateBlockStatus } = userSlice.actions;
export default userSlice.reducer;