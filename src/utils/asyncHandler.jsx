
const asyncHandler = (requestHandler) => {
    (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).
        catch(next).catch((err) => next(err))
    } 
}

export {asyncHandler}




// const asyncHandler = (func) => async () => { } //higher order function

// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message || "Something went wrong"
//         })
//         next(err)
//     }
// } 
